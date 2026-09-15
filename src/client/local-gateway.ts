import type { GameState } from '../domain/types';
import type { GameGateway } from './gateway';
export function createLocalGateway(): GameGateway {
  const worker = new Worker(new URL('./local-host.worker.ts', import.meta.url), { type: 'module' });
  let id = 'local-a',
    state: GameState | null = null,
    serial = 0;
  const listeners = new Set<(s: GameState) => void>();
  const events = new Map<string, Set<(p: unknown) => void>>();
  worker.onmessage = (e) => {
    const msg = e.data;
    if (msg.type === 'state') {
      state = msg.state;
      for (const fn of listeners) fn(state!);
    } else if (!msg.id || msg.id === id)
      for (const fn of events.get(msg.event) ?? []) fn(msg.payload);
  };
  const gateway: GameGateway = {
    get playerId() {
      return id;
    },
    local: true,
    subscribe(fn) {
      listeners.add(fn);
      if (state) fn(state);
      return () => {
        listeners.delete(fn);
      };
    },
    onEvent(name, fn) {
      if (!events.has(name)) events.set(name, new Set());
      events.get(name)!.add(fn);
      return () => {
        events.get(name)!.delete(fn);
      };
    },
    send(action, payload) {
      worker.postMessage({ id, action, payload });
    },
    command(c) {
      const commandId = `local:${++serial}`;
      gateway.send('command', { ...c, commandId });
      return commandId;
    },
    switchSeat() {
      id = id === 'local-a' ? 'local-b' : 'local-a';
      if (state) for (const fn of listeners) fn(state);
    },
    dispose() {
      worker.terminate();
    },
  };
  return gateway;
}
