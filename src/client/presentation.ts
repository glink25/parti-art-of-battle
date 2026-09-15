import type { GameState, Position } from '../domain/types';
import type { ReplayFrame } from '../combat/replay';
import { UNIT_BY_ID } from '../content';
import type { SceneUnit } from './scene';
export function positionToWorld(position: Position, seat = 0): { x: number; z: number } {
  if (position.zone === 'board') return { x: position.x - 4.5, z: position.y - 4.5 };
  if (position.zone === 'public')
    return { x: -0.5 + (position.slot % 2), z: 5.7 + Math.floor(position.slot / 2) };
  return {
    x: (seat === 0 ? -4.5 : 1.5) + (position.slot % 4),
    z: 5.7 + Math.floor(position.slot / 4),
  };
}
export function preparationUnits(s: GameState, teamId: string): SceneUnit[] {
  return Object.values(s.units)
    .filter((u) => u.teamId === teamId)
    .map((u) => ({
      ...positionToWorld(u.position, s.players[u.ownerId]?.seat),
      id: u.id,
      defId: u.defId,
      star: u.star,
      ownerId: u.ownerId,
      side: 0,
      seat: s.players[u.ownerId]?.seat,
      layer: UNIT_BY_ID[u.defId].layer,
    }));
}
export function replayUnits(f: ReplayFrame): SceneUnit[] {
  return f.units.map((u) => ({ ...u, x: u.x - 4.5, z: u.y - 4.5, ownerId: '' }));
}
