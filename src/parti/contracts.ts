import type { GameState } from '../domain/types';
export interface RoomPlayer {
  id: string;
  name: string;
  role: 'host' | 'player' | 'spectator';
}
export interface RoomContext {
  state: GameState;
  players: RoomPlayer[];
  host: RoomPlayer;
  now(): number;
  random(): number;
  send(id: string, event: string, payload?: unknown): void;
  broadcast(event: string, payload?: unknown): void;
  setTimer(name: string, ms: number, callback: () => void): void;
  clearTimer(name: string): void;
  log(...args: unknown[]): void;
}
export interface ActionEvent {
  player: RoomPlayer;
  payload: unknown;
  actionId: string;
}
export interface RoomDefinition {
  meta?: { name: string; minPlayers: number; maxPlayers: number };
  initialState(): GameState;
  onCreate?(ctx: RoomContext): void;
  onJoin?(ctx: RoomContext, p: RoomPlayer): void;
  onLeave?(ctx: RoomContext, p: RoomPlayer): void;
  onReady?(ctx: RoomContext, p: RoomPlayer): void;
  onRestore?(ctx: RoomContext): void;
  onReconnect?(ctx: RoomContext, p: RoomPlayer): void;
  actions: Record<string, (ctx: RoomContext, event: ActionEvent) => void>;
}
