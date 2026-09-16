import { defineRoom } from '@parti/worker-sdk';
import type { RoomContext } from './contracts';
import { addPlayer, applyCommand, createGame } from '../rules/game';
import {
  beginRound,
  commitBattleResults,
  freezeBattles,
  settleRound,
  startMatch,
} from '../match/lifecycle';
import { advanceBots } from '../bots/planner';
import { LocalBattleExecutor } from '../combat/executor';
import { createBattle, finishBattle, stepBattle } from '../combat/engine';
import { frame } from '../combat/replay';
import { CONTENT_HASH, RULES, validateContent } from '../content';
let executor: LocalBattleExecutor | null = null;
let closing = false;
let roundComputeMs = 0;
let maxSliceMs = 0;
let computeSlices = 0;
const replayRequests = new Set<string>();
function safe(ctx: RoomContext, fn: () => void): void {
  try {
    fn();
  } catch (e) {
    ctx.state.error = e instanceof Error ? e.message : String(e);
    ctx.state.phase = 'error';
    for (const timer of ['prep', 'bots', 'compute', 'playback', 'next']) ctx.clearTimer(timer);
    ctx.log('game:error', ctx.state.error);
  }
}
function schedule(ctx: RoomContext, name: string, ms: number, fn: () => void): void {
  ctx.setTimer(name, ms, () => safe(ctx, fn));
}
function prepare(ctx: RoomContext): void {
  closing = false;
  executor = null;
  ctx.state.deadline = ctx.now() + RULES.prepMs;
  schedule(ctx, 'prep', RULES.prepMs, () => {
    closing = true;
    pumpBots(ctx);
  });
  schedule(ctx, 'bots', 50, () => pumpBots(ctx));
}
function pumpBots(ctx: RoomContext): void {
  if (ctx.state.phase !== 'prep') return;
  let work = false;
  for (let i = 0; i < 2; i++) {
    work = advanceBots(ctx.state);
    if (!work) break;
  }
  if (closing && !work) {
    ctx.clearTimer('prep');
    ctx.clearTimer('bots');
    freezeBattles(ctx.state);
    beginCompute(ctx);
    return;
  }
  if (work) schedule(ctx, 'bots', 30, () => pumpBots(ctx));
}
function beginCompute(ctx: RoomContext): void {
  // `closing` only seals the expired preparation window. Battle commands operate
  // on the persistent bench/shop while descriptors below remain frozen.
  closing = false;
  executor = new LocalBattleExecutor(ctx.state.battles.filter((b) => !ctx.state.results[b.id]));
  roundComputeMs = 0;
  maxSliceMs = 0;
  computeSlices = 0;
  ctx.state.deadline = 0;
  schedule(ctx, 'compute', 1, () => compute(ctx));
}
function compute(ctx: RoomContext): void {
  if (ctx.state.phase !== 'battle' || !executor) return;
  const started = ctx.now();
  const completed = executor.advance(8);
  const elapsed = ctx.now() - started;
  roundComputeMs += elapsed;
  maxSliceMs = Math.max(maxSliceMs, elapsed);
  computeSlices++;
  commitBattleResults(ctx.state, completed);
  if (!executor.done) {
    schedule(ctx, 'compute', 1, () => compute(ctx));
    return;
  }
  ctx.log('game:performance', {
    round: ctx.state.round,
    battles: ctx.state.battles.length,
    computeMs: roundComputeMs,
    maxSliceMs,
    computeSlices,
    snapshotBytes: new TextEncoder().encode(JSON.stringify(ctx.state)).length,
  });
  // Results are authoritative, but preparation cannot resume before the viewing interval.
  const ticks = Math.max(0, ...Object.values(ctx.state.results).map((r) => r.ticks));
  ctx.state.deadline = ctx.now() + Math.max(2000, ticks * 50);
  ctx.state.playbackEpoch++;
  schedule(ctx, 'playback', Math.max(2000, ticks * 50), () => {
    settleRound(ctx.state);
    if (ctx.state.phase === 'settlement')
      schedule(ctx, 'next', 3000, () => {
        beginRound(ctx.state);
        prepare(ctx);
      });
  });
}
function recover(ctx: RoomContext): void {
  validateContent();
  if (
    ctx.state.contentHash !== CONTENT_HASH ||
    ctx.state.rulesetId !== RULES.id ||
    ctx.state.simulationVersion !== RULES.simulationVersion
  )
    throw new Error('房间版本不匹配，请用原版本恢复或创建新房间');
  replayRequests.clear();
  executor = null;
  closing = false;
  if (ctx.state.phase === 'error') {
    ctx.state.error = null;
    ctx.state.phase =
      ctx.state.battles.length && ctx.state.settledRound !== ctx.state.round ? 'battle' : 'prep';
  }
  if (ctx.state.phase === 'prep') prepare(ctx);
  else if (ctx.state.phase === 'battle') beginCompute(ctx);
  else if (ctx.state.phase === 'settlement')
    schedule(ctx, 'next', 3000, () => {
      beginRound(ctx.state);
      prepare(ctx);
    });
}
export default defineRoom({
  meta: { name: '共生战线', minPlayers: 2, maxPlayers: 2 },
  initialState: () => createGame(),
  onCreate(ctx) {
    validateContent();
    ctx.state.seed = Math.floor(ctx.random() * 0xffffffff) >>> 0;
    ctx.state.rewardRng = ctx.state.seed || 1;
  },
  onJoin(ctx, p) {
    if (ctx.state.players[p.id]) return;
    if (
      ctx.state.phase !== 'waiting' ||
      Object.values(ctx.state.players).filter((x) => !x.bot).length >= 2
    )
      return;
    addPlayer(ctx.state, p.id, p.name, 'team-0', Object.keys(ctx.state.players).length);
  },
  onLeave(ctx, p) {
    if (ctx.state.phase === 'waiting' && ctx.state.players[p.id]) {
      const team = ctx.state.teams['team-0'];
      team.players = team.players.filter((id) => id !== p.id);
      delete ctx.state.players[p.id];
      team.players.forEach((id, seat) => (ctx.state.players[id].seat = seat));
    }
  },
  onRestore(ctx) {
    safe(ctx, () => recover(ctx));
  },
  onReconnect(ctx, p) {
    ctx.send(p.id, 'game:connected', { message: '已恢复原席位' });
  },
  actions: {
    clock(ctx, { player, payload }) {
      ctx.send(player.id, 'game:clock', {
        nonce: (payload as { nonce?: number })?.nonce,
        round: ctx.state.round,
        epoch: ctx.state.playbackEpoch,
        phase: ctx.state.phase,
        remaining: Math.max(0, ctx.state.deadline - ctx.now()),
      });
    },
    start(ctx, { player }) {
      safe(ctx, () => {
        if (
          player.id !== ctx.host.id ||
          ctx.state.phase !== 'waiting' ||
          Object.values(ctx.state.players).filter((p) => !p.bot).length !== 2
        )
          return;
        startMatch(ctx.state);
        prepare(ctx);
      });
    },
    command(ctx, { player, payload }) {
      const commandId = (payload as { commandId?: string })?.commandId;
      const receipt = ctx.state.receipts[player.id]?.find((r) => r.commandId === commandId);
      if (receipt) {
        ctx.send(player.id, 'game:command', receipt);
        return;
      }
      if (ctx.state.phase === 'prep' && (closing || ctx.now() >= ctx.state.deadline)) {
        ctx.send(player.id, 'game:command', {
          commandId: (payload as { commandId?: string })?.commandId,
          ok: false,
          reason: '准备阶段已结束',
        });
        return;
      }
      const result = applyCommand(ctx.state, player.id, payload);
      ctx.send(player.id, 'game:command', result);
      if (
        result.ok &&
        ctx.state.phase === 'prep' &&
        Object.values(ctx.state.players)
          .filter((p) => !p.bot)
          .every((p) => p.ready)
      ) {
        closing = true;
        ctx.clearTimer('prep');
        schedule(ctx, 'bots', 1, () => pumpBots(ctx));
      }
    },
    retry(ctx, { player }) {
      if (player.id === ctx.host.id && ctx.state.phase === 'error') safe(ctx, () => recover(ctx));
    },
    replay(ctx, { player, payload }) {
      const id = (payload as { id?: string })?.id;
      const descriptor = ctx.state.battles.find((b) => b.id === id);
      if (!descriptor || replayRequests.has(player.id)) return;
      replayRequests.add(player.id);
      const s = createBattle(descriptor);
      let sequence = 0;
      ctx.send(player.id, 'game:replay', { id, sequence: sequence++, frame: frame(s) });
      const pump = () => {
        if (!ctx.state.battles.some((b) => b.id === id)) {
          replayRequests.delete(player.id);
          return;
        }
        const events = stepBattle(s, 4);
        ctx.send(player.id, 'game:replay', { id, sequence: sequence++, frame: frame(s, events) });
        if (s.done) {
          ctx.send(player.id, 'game:replay', { id, sequence, result: finishBattle(s) });
          replayRequests.delete(player.id);
        } else schedule(ctx, `replay:${player.id}`, 1, pump);
      };
      schedule(ctx, `replay:${player.id}`, 1, pump);
    },
  },
});
