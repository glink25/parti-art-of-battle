import type { GameState } from '../domain/types';
import type { BattleReplay, ReplayFrame } from '../combat/replay';
import type { GameGateway } from './gateway';
import { damageStatsAt, type CombatStatRow } from './combat-stats';
export class ReplayController {
  private worker = new Worker(new URL('./replay.worker.ts', import.meta.url), { type: 'module' });
  private state: GameState | null = null;
  private replay: BattleReplay | null = null;
  private id = '';
  private index = -1;
  private fallback = false;
  private requested = false;
  private frames: ReplayFrame[] = [];
  private sequence = 0;
  private invalidStream = false;
  private clockKey = '';
  private nonce = 0;
  private sent = 0;
  private anchor = 0;
  private remaining = 0;
  private started = 0;
  private epoch = -1;
  private viewedSide = 0;
  private offs: (() => void)[] = [];
  constructor(
    private gateway: GameGateway,
    private show: (
      frame: ReplayFrame,
      events: ReplayFrame['events'],
      damage: CombatStatRow[],
    ) => void,
    private notify: (message: string) => void,
  ) {
    this.worker.onmessage = (e) => {
      if (e.data.id && e.data.id !== this.id) return;
      if (e.data.ok && e.data.replay.id === this.id) {
        this.replay = e.data.replay;
        this.index = -1;
        this.verify();
      } else if (!e.data.ok) this.notify(`战斗回放暂停：${e.data.error}`);
    };
    this.offs.push(
      gateway.onEvent('game:clock', (payload) => {
        const p = payload as {
          nonce: number;
          round: number;
          epoch: number;
          phase: string;
          remaining: number;
        };
        const s = this.state;
        if (
          !s ||
          p.nonce !== this.nonce ||
          p.round !== s.round ||
          p.epoch !== s.playbackEpoch ||
          p.phase !== s.phase
        )
          return;
        const now = performance.now();
        this.anchor = now;
        this.remaining = Math.max(0, p.remaining - (now - this.sent) / 2);
        if (s.phase === 'battle' && s.deadline) {
          this.started = now - Math.max(0, this.duration() - this.remaining);
          this.index = -1;
        }
      }),
    );
    this.offs.push(
      gateway.onEvent('game:replay', (payload) => {
        const p = payload as {
          id: string;
          sequence: number;
          frame?: ReplayFrame;
          result?: BattleReplay['result'];
        };
        if (p.id !== this.id) return;
        if (p.sequence === 0) {
          this.frames = [];
          this.sequence = 0;
          this.invalidStream = false;
        }
        if (this.invalidStream) return;
        if (p.sequence !== this.sequence++) {
          this.invalidStream = true;
          this.notify('回放记录不完整，请切换战场重试');
          return;
        }
        if (p.frame) this.frames.push(p.frame);
        if (p.result) {
          this.replay = { id: p.id, frames: this.frames, result: p.result };
          this.fallback = false;
          this.index = -1;
          this.notify('已恢复战斗画面');
        }
      }),
    );
  }
  private duration(): number {
    return Math.max(2000, ...Object.values(this.state?.results ?? {}).map((r) => r.ticks * 50));
  }
  update(s: GameState, team: string): boolean {
    this.state = s;
    const key = `${s.round}:${s.phase}:${s.deadline}:${s.playbackEpoch}`;
    if (key !== this.clockKey) {
      this.clockKey = key;
      this.anchor = performance.now();
      this.remaining = s.deadline ? Math.max(0, s.deadline - Date.now()) : 0;
      this.sent = performance.now();
      this.gateway.send('clock', { nonce: ++this.nonce });
    }
    const d =
      s.phase === 'battle'
        ? s.battles.find((b) => b.teams[0] === team || (b.teams[1] === team && !b.mirror))
        : null;
    if (!d) {
      this.id = '';
      this.replay = null;
      return false;
    }
    const viewedSide = d.teams[0] === team ? 0 : 1;
    if (viewedSide !== this.viewedSide) this.index = -1;
    this.viewedSide = viewedSide;
    if (this.id !== d.id) {
      this.id = d.id;
      this.replay = null;
      this.index = -1;
      this.fallback = false;
      this.requested = false;
      this.worker.postMessage(d);
    }
    if (this.epoch !== s.playbackEpoch) {
      this.epoch = s.playbackEpoch;
      this.started = performance.now() - Math.max(0, this.duration() - this.remaining);
      this.index = -1;
    }
    this.verify();
    return true;
  }
  private verify(): void {
    if (!this.replay || this.requested) return;
    const result = this.state?.results[this.id];
    if (result && result.hash !== this.replay.result.hash) {
      this.fallback = true;
      this.requested = true;
      this.replay = null;
      this.notify('正在同步战斗画面');
      this.gateway.send('replay', { id: this.id });
    }
  }
  tick(): { remaining: number; active: boolean } {
    const now = performance.now();
    if (this.replay && this.state?.phase === 'battle' && !this.fallback) {
      const index = this.state.deadline
        ? Math.max(
            0,
            Math.min(this.replay.frames.length - 1, Math.floor((now - this.started) / 200)),
          )
        : 0;
      if (index !== this.index) {
        const events =
          index > this.index && this.index >= 0 && index - this.index < 6
            ? this.replay.frames.slice(this.index + 1, index + 1).flatMap((f) => f.events)
            : [];
        this.show(
          this.replay.frames[index],
          events,
          damageStatsAt(this.replay.frames, index, this.viewedSide),
        );
        this.index = index;
      }
    }
    return {
      remaining: Math.max(0, this.remaining - (now - this.anchor)),
      active: !!this.state?.deadline,
    };
  }
  stop(): void {
    this.state = null;
    this.replay = null;
    this.id = '';
    this.remaining = 0;
  }
  dispose(): void {
    this.worker.terminate();
    for (const off of this.offs) off();
  }
}
