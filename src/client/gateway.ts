import type { Command, GameState } from '../domain/types';
export interface PartiClient {
  playerId: string | null;
  getState(): unknown;
  onState(fn: (s: unknown) => void): () => void;
  onEvent(event: string, fn: (p: unknown) => void): () => void;
  action(action: string, payload?: unknown): Promise<{ ok: true }>;
  ready(): void;
  exposeToAgent?(fn: (s: unknown) => unknown): void;
}
declare global {
  interface Window {
    parti?: PartiClient;
  }
}
export interface GameGateway {
  readonly playerId: string | null;
  readonly local: boolean;
  subscribe(fn: (s: GameState) => void): () => void;
  onEvent(event: string, fn: (p: unknown) => void): () => void;
  send(action: string, payload?: unknown): void;
  command(c: Omit<Command, 'commandId'>): string;
  switchSeat?(): void;
  dispose(): void;
}
export async function createGateway(): Promise<GameGateway> {
  if (!window.parti) {
    if (import.meta.env.DEV) {
      const { createLocalGateway } = await import('./local-gateway');
      return createLocalGateway();
    }
    throw new Error('请在 Parti 中导入完整房间包后运行。此页面需要 Parti 提供房间连接。');
  }
  const parti = window.parti;
  let serial = 0;
  const session = crypto.randomUUID();
  const transportListeners = new Set<(p: unknown) => void>();
  const gateway: GameGateway = {
    get playerId() {
      return parti.playerId;
    },
    local: false,
    subscribe(fn) {
      return parti.onState((s) => fn(s as GameState));
    },
    onEvent(name, fn) {
      if (name !== 'game:transport') return parti.onEvent(name, fn);
      transportListeners.add(fn);
      return () => {
        transportListeners.delete(fn);
      };
    },
    send(name, payload) {
      void parti.action(name, payload).catch(() => {
        for (const fn of transportListeners) fn('连接暂时中断，操作仍在等待房主确认');
      });
    },
    command(c) {
      const commandId = `${session}:${++serial}`;
      gateway.send('command', { ...c, commandId });
      return commandId;
    },
    dispose() {
      transportListeners.clear();
    },
  };
  parti.exposeToAgent?.((value) => {
    const s = value as GameState;
    return {
      phase: s.phase,
      round: s.round,
      player: s.players[parti.playerId ?? ''],
      team: s.teams['team-0'],
      units: Object.values(s.units).filter((u) => u.teamId === 'team-0'),
      actions: ['start', 'command'],
      commandTypes: [
        'buy',
        'refresh',
        'lock',
        'xp',
        'move',
        'swap',
        'sell',
        'equip',
        'ready',
        'demand',
      ],
      note: 'command requires commandId and round. Buy requires shopVersion. Unit actions require unitId and unitVersion. Swap additionally requires targetId and targetVersion; own bench/board or allied board pairs only, never public slots. Move to a bench may specify benchOwnerId. Equip also requires itemSlot and itemId.',
    };
  });
  parti.ready();
  return gateway;
}
