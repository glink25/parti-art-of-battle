import type { BattleDescriptor, BattleResult, BattleUnit, GameState } from '../domain/types';
import { compareId, deriveSeed } from '../domain/random';
import { RULES } from '../content';
import {
  addPlayer,
  addXp,
  baseIncome,
  grantLoot,
  grantRoundIncome,
  isNeutral,
  refreshShop,
  returnShop,
  teamUnits,
} from '../rules/game';
import { resetBotRound } from '../bots/planner';
export function startMatch(s: GameState): void {
  if (s.phase !== 'waiting' || Object.values(s.players).filter((p) => !p.bot).length !== 2)
    throw new Error('需要两位玩家');
  for (let team = 1; team < 8; team++)
    for (let seat = 0; seat < 2; seat++)
      addPlayer(
        s,
        `bot-${team}-${seat}`,
        `机师 ${team}${seat ? 'B' : 'A'}`,
        `team-${team}`,
        seat,
        true,
      );
  for (const p of Object.values(s.players)) p.gold = baseIncome(1);
  beginRound(s);
}
export function beginRound(s: GameState): void {
  s.round++;
  s.phase = 'prep';
  s.battles = [];
  s.results = {};
  s.error = null;
  for (const p of Object.values(s.players)) {
    p.ready = false;
    if (s.teams[p.teamId].hp <= 0) continue;
    addXp(p, 1);
    if (!p.shopLocked) refreshShop(s, p);
  }
  resetBotRound(s);
}
function lineup(s: GameState, team: string): BattleUnit[] {
  return teamUnits(s, team)
    .filter((u) => u.position.zone === 'board')
    .sort((a, b) => compareId(a.id, b.id))
    .map((u) => ({
      id: u.id,
      defId: u.defId,
      ownerId: u.ownerId,
      star: u.star,
      x: u.position.zone === 'board' ? u.position.x : 0,
      y: u.position.zone === 'board' ? u.position.y : 0,
      items: [...u.items],
    }));
}
function neutralUnits(round: number): BattleUnit[] {
  const count = round <= 3 ? round : Math.min(16, 3 + Math.floor(round / 3));
  const star = Math.min(3, 1 + Math.floor(round / 18));
  return Array.from({ length: count }, (_, i) => ({
    id: `wild-${i}`,
    defId: round < 10 ? 'dog' : i % 3 === 0 ? 'venom' : i % 3 === 1 ? 'wolf' : 'ape',
    ownerId: 'wild',
    star,
    x: 1 + (i % 8),
    y: 5 + Math.floor(i / 8),
    items: [],
  }));
}
export function freezeBattles(s: GameState): BattleDescriptor[] {
  if (s.phase !== 'prep') throw new Error('Not preparing');
  const teams = Object.values(s.teams)
    .filter((t) => t.hp > 0)
    .map((t) => t.id)
    .sort(
      (a, b) =>
        deriveSeed(s.seed, `${s.round}:${a}`) - deriveSeed(s.seed, `${s.round}:${b}`) ||
        compareId(a, b),
    );
  const pairs: { a: string; b: string; mirror: boolean }[] = [];
  const neutral = isNeutral(s.round);
  if (neutral) for (const a of teams) pairs.push({ a, b: 'wild', mirror: false });
  else {
    const remaining = [...teams];
    while (remaining.length > 1) {
      const a = remaining.shift()!;
      let index = remaining.findIndex((b) => b !== s.teams[a].lastOpponent);
      if (index < 0) index = 0;
      const b = remaining.splice(index, 1)[0];
      pairs.push({ a, b, mirror: false });
    }
    if (remaining.length) {
      const a = remaining[0];
      const b =
        teams.find((b) => b !== a && b !== s.teams[a].lastOpponent) ?? teams.find((b) => b !== a);
      if (b) pairs.push({ a, b, mirror: true });
    }
  }
  s.battles = pairs
    .map(({ a, b, mirror }, i) => {
      const id = `r${s.round}-b${i}`;
      const sides: [BattleUnit[], BattleUnit[]] = [
        lineup(s, a),
        neutral ? neutralUnits(s.round) : lineup(s, b),
      ];
      for (const [side, units] of sides.entries())
        for (const u of units) {
          u.id = `${id}:${side}:${u.id}`;
          if (side === 1) {
            u.x = 9 - u.x;
            u.y = 9 - u.y;
          }
        }
      return {
        id,
        round: s.round,
        seed: deriveSeed(s.seed, id),
        rulesetId: s.rulesetId,
        contentHash: s.contentHash,
        simulationVersion: s.simulationVersion,
        teams: [a, b] as [string, string],
        mirror,
        neutral,
        sides,
      };
    })
    .sort(
      (a, b) =>
        (a.teams.includes('team-0') ? 0 : 1) - (b.teams.includes('team-0') ? 0 : 1) ||
        compareId(a.id, b.id),
    );
  s.phase = 'battle';
  s.playbackEpoch++;
  return s.battles;
}
export function commitBattleResults(s: GameState, results: BattleResult[]): void {
  for (const r of results) {
    if (!s.battles.some((b) => b.id === r.id)) throw new Error('Unknown battle result');
    const old = s.results[r.id];
    if (old && old.hash !== r.hash) throw new Error('Conflicting result');
    s.results[r.id] = r;
  }
}
function rankTeams(s: GameState): void {
  const teams = Object.values(s.teams).sort(
    (a, b) =>
      (b.hp > 0 ? 1 : 0) - (a.hp > 0 ? 1 : 0) ||
      (b.eliminatedRound ?? s.round + 1) - (a.eliminatedRound ?? s.round + 1) ||
      b.hp - a.hp ||
      b.wins - a.wins ||
      deriveSeed(s.seed, a.id) - deriveSeed(s.seed, b.id),
  );
  teams.forEach((t, i) => (t.rank = i + 1));
}
export function settleRound(s: GameState): void {
  if (s.settledRound === s.round) return;
  if (s.phase !== 'battle' || s.battles.some((b) => !s.results[b.id]))
    throw new Error('Incomplete round results');
  const draft = structuredClone(s);
  draft.lastSummary = [];
  for (const battle of draft.battles) {
    const result = draft.results[battle.id];
    for (const side of [0, 1] as const) {
      if (side === 1 && (battle.neutral || battle.mirror)) continue;
      const team = draft.teams[battle.teams[side]],
        outcome = result.winner === null ? 'draw' : result.winner === side ? 'win' : 'loss';
      team.hp = Math.max(0, team.hp - result.damage[side]);
      if (outcome === 'win' && !battle.neutral) team.wins++;
      if (!battle.neutral) team.lastOpponent = battle.teams[side === 0 ? 1 : 0];
      draft.lastSummary.push(
        `${team.name} ${outcome === 'win' ? '获胜' : outcome === 'draw' ? '平局' : '落败'}${result.damage[side] ? ` · -${result.damage[side]} 生命` : ''}`,
      );
      if (outcome === 'win')
        for (const unit of battle.sides[side])
          if (unit.defId === 'alchemy_tower' && result.survivors.includes(unit.id)) {
            draft.players[unit.ownerId].gold += unit.star;
            draft.lastSummary.push(`${draft.players[unit.ownerId].name} 的炼金塔 +${unit.star} 金`);
          }
      for (const id of team.players) {
        const p = draft.players[id];
        grantRoundIncome(p, draft.round, outcome, battle.neutral);
        if (battle.neutral && outcome === 'win') grantLoot(draft, p);
      }
    }
  }
  for (const t of Object.values(draft.teams))
    if (t.hp === 0 && t.eliminatedRound === null) {
      t.eliminatedRound = draft.round;
      for (const id of t.players) returnShop(draft, draft.players[id]);
      for (const u of teamUnits(draft, t.id)) {
        draft.pool[u.defId] += u.copies;
        delete draft.units[u.id];
      }
    }
  draft.settledRound = draft.round;
  draft.phase =
    Object.values(draft.teams).filter((t) => t.hp > 0).length <= 1 || draft.round >= RULES.maxRounds
      ? 'finished'
      : 'settlement';
  rankTeams(draft);
  Object.assign(s, draft);
}
