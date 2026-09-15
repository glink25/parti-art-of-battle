import type { UnitInstance } from '../domain/types';
import { hashValue } from '../domain/random';
import { ITEM_BY_ID, ITEMS } from './items';
import { PLACEMENT_LIMITS, RULES } from './rules';
import { SYNERGIES } from './synergies';
import { COMBAT_VISUALS, UNIT_BY_ID, UNIT_IDS, UNITS } from './units';

export {
  COMBAT_VISUALS,
  ITEM_BY_ID,
  ITEMS,
  PLACEMENT_LIMITS,
  RULES,
  SYNERGIES,
  UNIT_BY_ID,
  UNIT_IDS,
  UNITS,
};
export const CONTENT_HASH = hashValue({ RULES, UNITS, SYNERGIES, ITEMS, PLACEMENT_LIMITS });

export function saleValue(unit: UnitInstance): number {
  const cost = UNIT_BY_ID[unit.defId].cost;
  return unit.star === 1
    ? cost
    : Math.max(1, Math.floor((cost * unit.copies * RULES.salePercent) / 100));
}

export function validateContent(): void {
  if (UNITS.length !== 62 || new Set(UNIT_IDS).size !== 62)
    throw new Error('Expected 62 unique units');
  if (SYNERGIES.length !== 24 || ITEMS.length !== 10) throw new Error('Incomplete content catalog');
  for (const row of RULES.shopOdds)
    if (
      row.length !== 5 ||
      row.some((n) => n < 0) ||
      row.reduce<number>((a, b) => a + b, 0) !== 100
    )
      throw new Error('Invalid shop odds');
  for (const [index, value] of RULES.experience.entries())
    if (index && value <= RULES.experience[index - 1]) throw new Error('Invalid XP thresholds');
  for (const unit of UNITS) {
    if (
      unit.cost < 1 ||
      unit.cost > 5 ||
      unit.hp <= 0 ||
      unit.tags.some((tag) => !SYNERGIES.some((s) => s.id === tag))
    )
      throw new Error(`Invalid unit ${unit.id}`);
    if (
      !unit.skill.effects.length ||
      unit.skill.effects.some((effect) => effect.summonId && !UNIT_BY_ID[effect.summonId])
    )
      throw new Error(`Invalid effects ${unit.id}`);
    if (
      unit.attackTiming.windupTicks +
        unit.attackTiming.travelTicks +
        unit.attackTiming.recoveryTicks >
        unit.attackTicks ||
      unit.skill.timing.windupTicks +
        unit.skill.timing.travelTicks +
        unit.skill.timing.recoveryTicks >
        unit.skill.cooldown
    )
      throw new Error(`Invalid timing ${unit.id}`);
  }
  if (
    new Set(UNITS.map((unit) => unit.combatVisual.attack)).size !== 62 ||
    new Set(UNITS.map((unit) => unit.combatVisual.skill)).size !== 62
  )
    throw new Error('Combat visuals must be unique');
  for (const synergy of SYNERGIES)
    if (synergy.thresholds.length !== synergy.values.length)
      throw new Error(`Invalid synergy ${synergy.id}`);
  if (new Set(ITEMS.map((item) => item.id)).size !== 10) throw new Error('Duplicate item IDs');
  for (const item of ITEMS)
    if (
      !item.effects.length ||
      [item.attack, item.hp, item.armor, item.haste, item.lifesteal, item.skillBonus].some(
        (value) => !Number.isFinite(value) || value < 0,
      )
    )
      throw new Error(`Invalid item ${item.id}`);
  for (let cost = 1; cost <= 5; cost++)
    if (!UNITS.some((unit) => unit.cost === cost)) throw new Error(`Missing cost ${cost}`);
}
