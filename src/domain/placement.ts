import type { GameState, Position } from './types';
export interface PlacementLimits {
  boardSize: number;
  deploymentRow: number;
  benchSize: number;
  publicSize: number;
}
export interface PlacementIntent {
  kind: 'move' | 'swap';
  unitId: string;
  unitVersion: number;
  position?: Position;
  benchOwnerId?: string;
  targetId?: string;
  targetVersion?: number;
}
export interface PlacementDecision {
  ok: boolean;
  reason: string;
  ownerId?: string;
}
export function samePosition(a: Position, b: Position): boolean {
  return (
    a.zone === b.zone &&
    (a.zone === 'board' && b.zone === 'board'
      ? a.x === b.x && a.y === b.y
      : a.zone !== 'board' && b.zone !== 'board' && a.slot === b.slot)
  );
}
export function isPosition(pos: Position | undefined, limits: PlacementLimits): pos is Position {
  if (!pos || typeof pos !== 'object') return false;
  return pos.zone === 'board'
    ? Number.isInteger(pos.x) &&
        Number.isInteger(pos.y) &&
        pos.x >= 0 &&
        pos.x < limits.boardSize &&
        pos.y >= limits.deploymentRow &&
        pos.y < limits.boardSize
    : (pos.zone === 'bench' || pos.zone === 'public') &&
        Number.isInteger(pos.slot) &&
        pos.slot >= 0 &&
        pos.slot < (pos.zone === 'bench' ? limits.benchSize : limits.publicSize);
}
/** Shared by authority and presentation. Does not mutate state or infer permission from geometry. */
export function assessPlacement(
  s: GameState,
  actor: string,
  intent: PlacementIntent,
  limits: PlacementLimits,
): PlacementDecision {
  const fail = (reason: string): PlacementDecision => ({ ok: false, reason });
  const p = s.players[actor],
    u = s.units[intent.unitId];
  if (s.phase !== 'prep' && s.phase !== 'battle') return fail('当前不能布阵');
  if (!p || s.teams[p.teamId]?.hp <= 0) return fail('没有可操作的席位');
  if (!u || u.teamId !== p.teamId) return fail('只能操作本队棋子');
  if (u.version !== intent.unitVersion) return fail('棋子已变化');
  if (!isPosition(u.position, limits)) return fail('源棋子位置无效');
  if (s.phase === 'battle' && u.position.zone === 'board') return fail('战斗中不能调整出战阵容');
  if (intent.kind === 'swap') {
    const other = s.units[intent.targetId ?? ''];
    if (!other || other.id === u.id) return fail('请选择另一枚棋子');
    if (other.teamId !== p.teamId) return fail('不能与敌方换位');
    if (other.version !== intent.targetVersion) return fail('目标棋子已变化');
    if (!isPosition(other.position, limits)) return fail('目标棋子位置无效');
    if (s.phase === 'battle' && other.position.zone === 'board')
      return fail('战斗中不能调整出战阵容');
    if (u.position.zone === 'public' || other.position.zone === 'public')
      return fail('公共区棋子请先领取');
    if (
      !(u.position.zone === 'board' && other.position.zone === 'board') &&
      (u.ownerId !== actor || other.ownerId !== actor)
    )
      return fail('不能操作队友私人备战区');
    for (const id of new Set([u.ownerId, other.ownerId])) {
      const count = Object.values(s.units).filter(
        (v) =>
          v.ownerId === id &&
          (v.id === u.id
            ? other.position.zone
            : v.id === other.id
              ? u.position.zone
              : v.position.zone) === 'board',
      ).length;
      if (count > s.players[id].level) return fail('交换后人口超出上限');
    }
    return { ok: true, reason: '' };
  }
  const pos = intent.position;
  if (!isPosition(pos, limits)) return fail('请放入己方有效格子');
  if (s.phase === 'battle' && pos.zone === 'board') return fail('战斗中不能调整出战阵容');
  if (u.position.zone === 'bench' && u.ownerId !== actor) return fail('不能操作队友私人备战区');
  if (u.ownerId !== actor && u.position.zone === 'board' && pos.zone !== 'board')
    return fail('队友场上棋子仅可调整站位');
  if (u.position.zone === 'public' && pos.zone !== 'bench') return fail('请先领取到私人备战区');
  const ownerId = u.position.zone === 'public' ? actor : u.ownerId;
  if (pos.zone === 'bench' && intent.benchOwnerId && intent.benchOwnerId !== ownerId)
    return fail('请放入自己的备战区');
  if (
    Object.values(s.units).some(
      (v) =>
        v.id !== u.id &&
        v.teamId === p.teamId &&
        samePosition(v.position, pos) &&
        (pos.zone !== 'bench' || v.ownerId === ownerId),
    )
  )
    return fail('目标格已有棋子，可拖拽换位');
  if (
    pos.zone === 'board' &&
    u.position.zone !== 'board' &&
    Object.values(s.units).filter((v) => v.ownerId === ownerId && v.position.zone === 'board')
      .length >= s.players[ownerId].level
  )
    return fail('上阵人口已满');
  return { ok: true, reason: '', ownerId };
}
