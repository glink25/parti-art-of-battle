import type { AbilityEffect, ItemDefinition } from '../domain/types';

const item = (value: Omit<ItemDefinition, 'effects'>): ItemDefinition => {
  const effects: AbilityEffect[] = [];
  if (value.attack)
    effects.push({ trigger: 'battleStart', target: 'self', kind: 'attack', value: value.attack });
  if (value.hp)
    effects.push({ trigger: 'battleStart', target: 'self', kind: 'heal', value: value.hp });
  if (value.haste)
    effects.push({ trigger: 'battleStart', target: 'self', kind: 'haste', value: value.haste });
  if (value.skillResist)
    effects.push({
      trigger: 'battleStart',
      target: 'self',
      kind: 'shield',
      value: value.skillResist,
    });
  if (value.skillBonus)
    effects.push({
      trigger: 'battleStart',
      target: 'self',
      kind: 'skillDamage',
      value: value.skillBonus,
    });
  if (value.cooldown)
    effects.push({ trigger: 'battleStart', target: 'self', kind: 'haste', value: value.cooldown });
  if (value.damageTakenSkill)
    effects.push({
      trigger: 'damaged',
      target: 'self',
      kind: 'skillDamage',
      value: value.damageTakenSkill,
    });
  if (value.onHitRamp)
    effects.push({ trigger: 'attackHit', target: 'self', kind: 'attack', value: value.onHitRamp });
  if (value.silenceEnergy)
    effects.push({
      trigger: 'attackHit',
      target: 'current',
      kind: 'silence',
      value: value.silenceEnergy,
      duration: 30,
    });
  return { ...value, effects };
};
export const ITEMS: ItemDefinition[] = [
  item({
    id: 'blade',
    name: '修罗刀',
    description: '攻击 +25，刺杀暴击强化',
    attack: 25,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
  }),
  item({
    id: 'shield',
    name: '吸收磁盾',
    description: '生命 +160，护甲 +4；受击叠加技能效果',
    attack: 0,
    hp: 160,
    armor: 4,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
    damageTakenSkill: 2,
  }),
  item({
    id: 'blood',
    name: '血池之主',
    description: '吸血 20%，攻击 +10',
    attack: 10,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 20,
    skillBonus: 0,
  }),
  item({
    id: 'clock',
    name: '光阴护符',
    description: '攻击间隔 -10%，技能冷却 -15%',
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 10,
    lifesteal: 0,
    skillBonus: 0,
    cooldown: 15,
  }),
  item({
    id: 'book',
    name: '神恩集',
    description: '技能效果 +30%，技能冷却 -10%',
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 30,
    cooldown: 10,
  }),
  item({
    id: 'capsule',
    name: '生命胶囊',
    description: '生命 +250；首次低生命获得短暂无控与技能减伤',
    attack: 0,
    hp: 250,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
    emergencyImmunity: 30,
  }),
  item({
    id: 'spicy',
    name: '辣妹',
    description: '技能效果 +45%',
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 0,
    lifesteal: 0,
    skillBonus: 45,
  }),
  item({
    id: 'splitter',
    name: '斩裂剑',
    description: '攻击间隔 -35%，但无法主动施法',
    attack: 0,
    hp: 0,
    armor: 0,
    haste: 35,
    lifesteal: 0,
    skillBonus: 0,
    noSkill: true,
  }),
  item({
    id: 'scythes',
    name: '双镰',
    description: '连续攻击同一目标逐层增伤，换目标重置',
    attack: 8,
    hp: 0,
    armor: 0,
    haste: 8,
    lifesteal: 0,
    skillBonus: 0,
    onHitRamp: 8,
  }),
  item({
    id: 'silence',
    name: '沉寂护符',
    description: '技能防御强化，并沉默高能量目标',
    attack: 0,
    hp: 80,
    armor: 2,
    haste: 0,
    lifesteal: 0,
    skillBonus: 0,
    skillResist: 20,
    silenceEnergy: 70,
  }),
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((value) => [value.id, value])) as Record<
  string,
  ItemDefinition
>;
