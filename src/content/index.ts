import type {
  ItemDefinition,
  SkillKind,
  SynergyDefinition,
  Tag,
  UnitDefinition,
  UnitInstance,
} from '../domain/types';
import { hashValue } from '../domain/random';
export const RULES = {
  id: 'twins-original-02',
  simulationVersion: '2',
  tickRate: 20,
  maxTicks: 900,
  entityCap: 64,
  triggerCap: 64,
  prepMs: 25000,
  maxRounds: 50,
  maxLevel: 8,
  benchSize: 8,
  publicSize: 4,
  salePercent: 75,
  refreshCost: 2,
  xpCost: 5,
  xpGain: 5,
  // Cumulative thresholds; project-designed, not historical client data.
  experience: [0, 1, 3, 7, 15, 27, 45, 69],
  shopOdds: [
    [100, 0, 0, 0, 0],
    [80, 20, 0, 0, 0],
    [65, 30, 5, 0, 0],
    [50, 35, 15, 0, 0],
    [35, 35, 25, 5, 0],
    [25, 30, 30, 14, 1],
    [18, 25, 32, 20, 5],
    [12, 20, 30, 28, 10],
  ],
  starScale: [100, 180, 320],
  poolByCost: [36, 30, 24, 18, 12],
  neutralDropChance: 70,
  damageArmorBase: 100,
  armorCoefficient: 6,
  attackEnergy: 20,
  hitEnergy: 10,
  earlyIncome: [1, 2, 3],
  baseIncome: 5,
  interestStep: 10,
  interestCap: 5,
  streakRewards: [
    [3, 1],
    [5, 2],
    [7, 3],
  ],
  itemSlots: 3,
  minAttackTicks: 5,
  maxHaste: 70,
  botCommandBudget: 24,
  botRefreshBudget: 8,
};
const rows: [string, string, number, Tag, Tag, SkillKind, UnitDefinition['shape']][] = [
  ['shield', '护盾兵', 1, 'infantry', 'guard', 'stun', 'soldier'],
  ['gunner', '神枪手', 1, 'infantry', 'sniper', 'buff', 'soldier'],
  ['medic', '军医', 2, 'infantry', 'support', 'heal', 'soldier'],
  ['grenadier', '投弹手', 2, 'infantry', 'blast', 'damage', 'soldier'],
  ['commando', '特种兵', 4, 'infantry', 'sniper', 'damage', 'soldier'],
  ['lion', '狂狮', 3, 'beast', 'guard', 'stun', 'beast'],
  ['deer', '长生鹿', 1, 'beast', 'support', 'heal', 'beast'],
  ['wolf', '鬼狼', 2, 'beast', 'guard', 'summon', 'beast'],
  ['pangolin', '穿山甲', 2, 'beast', 'sniper', 'dash', 'beast'],
  ['venom', '猛毒兽', 4, 'beast', 'blast', 'poison', 'beast'],
  ['dog', '铁狗', 1, 'armor', 'blast', 'damage', 'mech'],
  ['ape', '铁猿', 3, 'armor', 'guard', 'shield', 'mech'],
  ['tank', '投石车', 3, 'armor', 'sniper', 'buff', 'mech'],
  ['titan', '铁巨神', 5, 'armor', 'blast', 'damage', 'mech'],
  ['repair', '维修机', 2, 'armor', 'support', 'heal', 'mech'],
  ['sage', '天师', 2, 'psionic', 'blast', 'damage', 'mystic'],
  ['child', '童子', 1, 'psionic', 'support', 'buff', 'mystic'],
  ['thunder', '雷震子', 3, 'psionic', 'sniper', 'damage', 'mystic'],
  ['master', '真人', 4, 'psionic', 'guard', 'summon', 'mystic'],
  ['turtle', '玄龟', 5, 'psionic', 'guard', 'shield', 'mystic'],
];
export const COMBAT_VISUALS: Record<
  string,
  Pick<UnitDefinition, 'attackTiming' | 'combatVisual'> & {
    skillTiming: UnitDefinition['skill']['timing'];
  }
> = {
  shield: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 5 },
    skillTiming: { windupTicks: 7, travelTicks: 0, recoveryTicks: 6 },
    combatVisual: {
      attack: 'shield-bash',
      skill: 'shield-quake',
      primary: 0x8eeed1,
      secondary: 0xffd784,
    },
  },
  gunner: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 0, recoveryTicks: 4 },
    combatVisual: {
      attack: 'gunner-tracer',
      skill: 'gunner-overdrive',
      primary: 0xffd36b,
      secondary: 0xff6f45,
    },
  },
  medic: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 4, recoveryTicks: 4 },
    combatVisual: {
      attack: 'medic-pulse',
      skill: 'medic-injector',
      primary: 0x75f0bc,
      secondary: 0xd9fff1,
    },
  },
  grenadier: {
    attackTiming: { windupTicks: 4, travelTicks: 5, recoveryTicks: 4 },
    skillTiming: { windupTicks: 6, travelTicks: 6, recoveryTicks: 5 },
    combatVisual: {
      attack: 'grenadier-shell',
      skill: 'grenadier-burst',
      primary: 0xff9b52,
      secondary: 0x4c3328,
    },
  },
  commando: {
    attackTiming: { windupTicks: 5, travelTicks: 2, recoveryTicks: 4 },
    skillTiming: { windupTicks: 8, travelTicks: 2, recoveryTicks: 6 },
    combatVisual: {
      attack: 'commando-shot',
      skill: 'commando-rail',
      primary: 0x8eeeff,
      secondary: 0xffffff,
    },
  },
  lion: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 5 },
    skillTiming: { windupTicks: 7, travelTicks: 0, recoveryTicks: 6 },
    combatVisual: {
      attack: 'lion-claw',
      skill: 'lion-roar',
      primary: 0xf5b44c,
      secondary: 0x8b4829,
    },
  },
  deer: {
    attackTiming: { windupTicks: 3, travelTicks: 4, recoveryTicks: 3 },
    skillTiming: { windupTicks: 6, travelTicks: 4, recoveryTicks: 5 },
    combatVisual: {
      attack: 'deer-spark',
      skill: 'deer-bloom',
      primary: 0x9cf08b,
      secondary: 0xf0ffb0,
    },
  },
  wolf: {
    attackTiming: { windupTicks: 3, travelTicks: 0, recoveryTicks: 4 },
    skillTiming: { windupTicks: 7, travelTicks: 2, recoveryTicks: 5 },
    combatVisual: {
      attack: 'wolf-rake',
      skill: 'wolf-rift',
      primary: 0x9e7cff,
      secondary: 0x34294f,
    },
  },
  pangolin: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 4 },
    skillTiming: { windupTicks: 5, travelTicks: 2, recoveryTicks: 5 },
    combatVisual: {
      attack: 'pangolin-roll',
      skill: 'pangolin-dash',
      primary: 0xe5b96f,
      secondary: 0x76593b,
    },
  },
  venom: {
    attackTiming: { windupTicks: 4, travelTicks: 5, recoveryTicks: 4 },
    skillTiming: { windupTicks: 6, travelTicks: 6, recoveryTicks: 5 },
    combatVisual: {
      attack: 'venom-spit',
      skill: 'venom-pool',
      primary: 0x8de35c,
      secondary: 0x47305c,
    },
  },
  dog: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 4, recoveryTicks: 4 },
    combatVisual: {
      attack: 'dog-cannon',
      skill: 'dog-charge',
      primary: 0xff8a55,
      secondary: 0x53616b,
    },
  },
  ape: {
    attackTiming: { windupTicks: 4, travelTicks: 0, recoveryTicks: 5 },
    skillTiming: { windupTicks: 7, travelTicks: 0, recoveryTicks: 6 },
    combatVisual: {
      attack: 'ape-punch',
      skill: 'ape-hexguard',
      primary: 0x72ddec,
      secondary: 0xa9f7ff,
    },
  },
  tank: {
    attackTiming: { windupTicks: 5, travelTicks: 6, recoveryTicks: 5 },
    skillTiming: { windupTicks: 6, travelTicks: 0, recoveryTicks: 5 },
    combatVisual: {
      attack: 'tank-boulder',
      skill: 'tank-overdrive',
      primary: 0xf1a95b,
      secondary: 0x59656c,
    },
  },
  titan: {
    attackTiming: { windupTicks: 5, travelTicks: 5, recoveryTicks: 5 },
    skillTiming: { windupTicks: 9, travelTicks: 7, recoveryTicks: 7 },
    combatVisual: {
      attack: 'titan-shell',
      skill: 'titan-bombard',
      primary: 0xff7048,
      secondary: 0xffd072,
    },
  },
  repair: {
    attackTiming: { windupTicks: 3, travelTicks: 3, recoveryTicks: 3 },
    skillTiming: { windupTicks: 5, travelTicks: 4, recoveryTicks: 4 },
    combatVisual: {
      attack: 'repair-bolt',
      skill: 'repair-beam',
      primary: 0x63e7dc,
      secondary: 0xe1fff4,
    },
  },
  sage: {
    attackTiming: { windupTicks: 4, travelTicks: 4, recoveryTicks: 4 },
    skillTiming: { windupTicks: 7, travelTicks: 3, recoveryTicks: 6 },
    combatVisual: {
      attack: 'sage-talisman',
      skill: 'sage-sigil',
      primary: 0xd2a6ff,
      secondary: 0xffd77c,
    },
  },
  child: {
    attackTiming: { windupTicks: 3, travelTicks: 4, recoveryTicks: 3 },
    skillTiming: { windupTicks: 6, travelTicks: 0, recoveryTicks: 5 },
    combatVisual: {
      attack: 'child-orb',
      skill: 'child-energy',
      primary: 0xb79cff,
      secondary: 0x76efff,
    },
  },
  thunder: {
    attackTiming: { windupTicks: 4, travelTicks: 3, recoveryTicks: 4 },
    skillTiming: { windupTicks: 8, travelTicks: 2, recoveryTicks: 6 },
    combatVisual: {
      attack: 'thunder-arc',
      skill: 'thunder-strike',
      primary: 0x86eaff,
      secondary: 0xfff6a6,
    },
  },
  master: {
    attackTiming: { windupTicks: 4, travelTicks: 4, recoveryTicks: 4 },
    skillTiming: { windupTicks: 7, travelTicks: 2, recoveryTicks: 5 },
    combatVisual: {
      attack: 'master-spirit',
      skill: 'master-gate',
      primary: 0xc59aff,
      secondary: 0x5b3a83,
    },
  },
  turtle: {
    attackTiming: { windupTicks: 4, travelTicks: 4, recoveryTicks: 4 },
    skillTiming: { windupTicks: 8, travelTicks: 0, recoveryTicks: 7 },
    combatVisual: {
      attack: 'turtle-wave',
      skill: 'turtle-aegis',
      primary: 0x6de6dc,
      secondary: 0x8ca8ff,
    },
  },
};
export const UNITS: UnitDefinition[] = rows.map(([id, name, cost, race, role, kind, shape]) => ({
  attackTiming: COMBAT_VISUALS[id].attackTiming,
  combatVisual: COMBAT_VISUALS[id].combatVisual,
  id,
  name,
  cost,
  poolCount: RULES.poolByCost[cost - 1],
  tags: [race, role],
  hp: 260 + cost * 95 + (role === 'guard' ? 180 : 0),
  attack: 30 + cost * 14,
  armor: role === 'guard' ? 8 : role === 'blast' ? 3 : 4,
  range: role === 'guard' ? 1 : role === 'sniper' ? 5 : 3,
  attackTicks: role === 'sniper' ? 17 : 23,
  moveTicks: 7,
  layer: id === 'repair' ? 'air' : 'ground',
  targets: ['ground', 'air'],
  skill: {
    kind,
    power: kind === 'summon' ? 1 : 80 + cost * 45,
    radius: role === 'blast' ? 2 : 1,
    duration: kind === 'poison' ? 80 : 35,
    cooldown: 100,
    timing: COMBAT_VISUALS[id].skillTiming,
  },
  assassin: id === 'pangolin',
  deathBurst: id === 'dog' ? 80 : undefined,
  linger: id === 'master' ? 40 : undefined,
  shape,
  color: (
    { infantry: 0x78c8b0, beast: 0xe5b96f, armor: 0x9aaab8, psionic: 0xae94d8 } as Record<
      string,
      number
    >
  )[race],
}));
export const UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u])) as Record<
  string,
  UnitDefinition
>;
export const SYNERGIES: SynergyDefinition[] = [
  {
    id: 'infantry',
    effect: 'hpPercent',
    values: [15, 30],
    name: '步兵',
    thresholds: [2, 4],
    description: '步兵生命 +15% / +30%',
  },
  {
    id: 'beast',
    effect: 'attackPercent',
    values: [15, 30],
    name: '野兽',
    thresholds: [2, 4],
    description: '野兽攻击 +15% / +30%',
  },
  {
    id: 'armor',
    effect: 'armor',
    values: [4, 8],
    name: '装甲',
    thresholds: [2, 4],
    description: '装甲护甲 +4 / +8',
  },
  {
    id: 'psionic',
    effect: 'energy',
    values: [30, 60],
    name: '灵能',
    thresholds: [2, 4],
    description: '灵能开场能量 +30 / +60',
  },
  {
    id: 'guard',
    effect: 'shield',
    values: [100, 220],
    name: '护卫',
    thresholds: [2, 4],
    description: '护卫开场护盾 100 / 220',
  },
  {
    id: 'sniper',
    effect: 'haste',
    values: [10, 20],
    name: '狙击',
    thresholds: [2, 4],
    description: '狙击攻击间隔 -10% / -20%',
  },
  {
    id: 'blast',
    effect: 'skillBonus',
    values: [20, 40],
    name: '爆破',
    thresholds: [2, 4],
    description: '爆破技能伤害 +20% / +40%',
  },
  {
    id: 'support',
    effect: 'deathHeal',
    values: [50, 100],
    name: '支援',
    thresholds: [2, 4],
    description: '支援单位死亡时全队治疗 50 / 100',
  },
];
export const ITEMS: ItemDefinition[] = [
  {
    id: 'blade',
    name: '修罗刀',
    description: '攻击 +25',
    attack: 25,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
  },
  {
    id: 'shield',
    name: '吸收磁盾',
    description: '生命 +160 · 护甲 +4',
    attack: 0,
    hp: 160,
    armor: 4,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
  },
  {
    id: 'blood',
    name: '血池之主',
    description: '吸血 20% · 攻击 +10',
    attack: 10,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 20,
    skillBonus: 0,
  },
  {
    id: 'clock',
    name: '光阴护符',
    description: '攻击间隔 -15%',
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 15,
    lifesteal: 0,
    skillBonus: 0,
  },
  {
    id: 'book',
    name: '神恩集',
    description: '技能效果 +30%',
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 30,
  },
  {
    id: 'capsule',
    name: '生命胶囊',
    description: '生命 +250',
    attack: 0,
    hp: 250,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
  },
];
export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i])) as Record<
  string,
  ItemDefinition
>;
export const PLACEMENT_LIMITS = {
  boardSize: 10,
  deploymentRow: 5,
  benchSize: RULES.benchSize,
  publicSize: RULES.publicSize,
};

export const CONTENT_HASH = hashValue({ RULES, UNITS, SYNERGIES, ITEMS, PLACEMENT_LIMITS });

export function saleValue(unit: UnitInstance): number {
  const cost = UNIT_BY_ID[unit.defId].cost;
  return unit.star === 1
    ? cost
    : Math.max(1, Math.floor((cost * unit.copies * RULES.salePercent) / 100));
}

export function validateContent(): void {
  if (UNITS.length !== 20 || new Set(UNITS.map((u) => u.id)).size !== UNITS.length)
    throw new Error('Expected 20 unique units');
  for (const row of RULES.shopOdds)
    if (row.length !== 5 || row.some((n) => n < 0) || row.reduce((a, b) => a + b, 0) !== 100)
      throw new Error('Invalid shop odds');
  for (const [i, n] of RULES.experience.entries())
    if (i && n <= RULES.experience[i - 1]) throw new Error('Invalid XP thresholds');
  for (const u of UNITS)
    if (
      u.cost < 1 ||
      u.cost > 5 ||
      !Number.isInteger(u.poolCount) ||
      u.poolCount < 1 ||
      u.hp <= 0 ||
      u.attackTicks < 1 ||
      u.tags.some((t) => !SYNERGIES.some((s) => s.id === t))
    )
      throw new Error(`Invalid unit ${u.id}`);
  const attackVisuals = new Set<string>(),
    skillVisuals = new Set<string>();
  for (const u of UNITS) {
    const timings = [u.attackTiming, u.skill.timing];
    if (
      !u.combatVisual.attack ||
      !u.combatVisual.skill ||
      attackVisuals.has(u.combatVisual.attack) ||
      skillVisuals.has(u.combatVisual.skill) ||
      timings.some((timing) =>
        [timing.windupTicks, timing.travelTicks, timing.recoveryTicks].some(
          (value) => !Number.isInteger(value) || value < 0,
        ),
      ) ||
      u.attackTiming.windupTicks + u.attackTiming.travelTicks + u.attackTiming.recoveryTicks >
        u.attackTicks ||
      u.skill.timing.windupTicks + u.skill.timing.travelTicks + u.skill.timing.recoveryTicks >
        u.skill.cooldown
    )
      throw new Error(`Invalid combat presentation ${u.id}`);
    attackVisuals.add(u.combatVisual.attack);
    skillVisuals.add(u.combatVisual.skill);
  }
  for (const synergy of SYNERGIES) {
    if (
      synergy.thresholds.length !== synergy.values.length ||
      synergy.thresholds.some(
        (v, i) => !Number.isInteger(v) || v < 1 || (i > 0 && v <= synergy.thresholds[i - 1]),
      ) ||
      synergy.values.some((v) => !Number.isFinite(v))
    )
      throw new Error(`Invalid synergy ${synergy.id}`);
  }
  if (new Set(ITEMS.map((i) => i.id)).size !== ITEMS.length) throw new Error('Duplicate item IDs');
  for (const item of ITEMS)
    for (const value of [
      item.attack,
      item.hp,
      item.armor,
      item.haste,
      item.lifesteal,
      item.skillBonus,
    ])
      if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid item ${item.id}`);
  for (const u of UNITS)
    if (
      ![
        u.hp,
        u.attack,
        u.armor,
        u.range,
        u.attackTicks,
        u.moveTicks,
        u.skill.power,
        u.skill.radius,
        u.skill.duration,
        u.skill.cooldown,
      ].every(Number.isInteger) ||
      u.moveTicks < 1 ||
      u.skill.cooldown < 1 ||
      !u.targets.length
    )
      throw new Error(`Invalid combat stats ${u.id}`);
  for (let cost = 1; cost <= 5; cost++)
    if (!UNITS.some((u) => u.cost === cost)) throw new Error(`Missing cost ${cost}`);
}
