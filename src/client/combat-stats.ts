import type { ReplayFrame } from '../combat/replay';

export interface CombatStatRow {
  unitId: string;
  defId: string;
  star: number;
  damage: number;
}

/** Builds presentation-only damage totals at an arbitrary replay frame. */
export function damageStatsAt(
  frames: ReplayFrame[],
  frameIndex: number,
  side: number,
  limit = 6,
): CombatStatRow[] {
  const identities = new Map<string, Omit<CombatStatRow, 'damage'>>();
  const damage = new Map<string, number>();
  const end = Math.min(Math.max(-1, frameIndex), frames.length - 1);

  for (let i = 0; i <= end; i++) {
    const frame = frames[i];
    for (const unit of frame.units)
      if (!identities.has(unit.id))
        identities.set(unit.id, { unitId: unit.id, defId: unit.defId, star: unit.star });
    for (const event of frame.events)
      if (event.kind === 'damage' && event.value && event.value > 0)
        damage.set(event.source, (damage.get(event.source) ?? 0) + event.value);
  }

  const sideIds = new Set<string>();
  for (let i = 0; i <= end; i++)
    for (const unit of frames[i].units) if (unit.side === side) sideIds.add(unit.id);

  return [...identities.values()]
    .filter((unit) => sideIds.has(unit.unitId) && (damage.get(unit.unitId) ?? 0) > 0)
    .map((unit) => ({ ...unit, damage: damage.get(unit.unitId) ?? 0 }))
    .sort((a, b) => b.damage - a.damage || a.unitId.localeCompare(b.unitId))
    .slice(0, Math.max(0, limit));
}
