/** Development only: runs the exact room definition in a real Worker, with two local seats. */
import room from '../parti/room';
import type { RoomContext } from '../parti/contracts';
const players = [
  { id: 'local-a', name: '你 · A 席', role: 'host' as const },
  { id: 'local-b', name: '队友 · B 席', role: 'player' as const },
];
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const publish = () => self.postMessage({ type: 'state', state: ctx.state });
const ctx: RoomContext = {
  state: room.initialState(),
  players,
  host: players[0],
  now: () => Date.now(),
  random: () => Math.random(),
  send(id, event, payload) {
    self.postMessage({ type: 'event', id, event, payload });
  },
  broadcast(event, payload) {
    self.postMessage({ type: 'event', event, payload });
  },
  setTimer(name, ms, fn) {
    ctx.clearTimer(name);
    timers.set(
      name,
      setTimeout(() => {
        timers.delete(name);
        fn();
        publish();
      }, ms),
    );
  },
  clearTimer(name) {
    clearTimeout(timers.get(name));
    timers.delete(name);
  },
  log(...args) {
    console.log(...args);
  },
};
room.onCreate?.(ctx);
for (const p of players) room.onJoin?.(ctx, p);
self.onmessage = (e: MessageEvent<{ id: string; action: string; payload: unknown }>) => {
  const p = players.find((p) => p.id === e.data.id);
  if (p)
    room.actions[e.data.action]?.(ctx, { player: p, payload: e.data.payload, actionId: 'local' });
  publish();
};
publish();
