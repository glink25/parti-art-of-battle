import assert from 'node:assert/strict';
import test from 'node:test';
import type { ReplayFrame } from '../src/combat/replay';
import { damageStatsAt } from '../src/client/combat-stats';

function unit(id: string, defId: string, side: number, star = 1) {
  return {
    id,
    defId,
    side,
    star,
    x: 0,
    y: 0,
    hp: 100,
    maxHp: 100,
    shield: 0,
    layer: 'ground',
    stunUntil: 0,
    poisonUntil: 0,
    buffUntil: 0,
    deathAt: null,
    action: null,
  };
}

const frames: ReplayFrame[] = [
  {
    battleId: 'test',
    tick: 0,
    actions: [],
    deathBursts: [],
    units: [unit('ally-b', 'gunner', 0), unit('ally-a', 'shield', 0, 2), unit('enemy', 'wolf', 1)],
    events: [],
  },
  {
    battleId: 'test',
    tick: 4,
    actions: [],
    deathBursts: [],
    units: [unit('ally-b', 'gunner', 0), unit('ally-a', 'shield', 0, 2), unit('enemy', 'wolf', 1)],
    events: [
      { tick: 2, kind: 'damage', source: 'ally-b', target: 'enemy', value: 40 },
      { tick: 3, kind: 'heal', source: 'ally-a', target: 'ally-b', value: 99 },
      { tick: 4, kind: 'damage', source: 'enemy', target: 'ally-a', value: 70 },
    ],
  },
  {
    battleId: 'test',
    tick: 8,
    actions: [],
    deathBursts: [],
    units: [
      unit('ally-b', 'gunner', 0),
      unit('ally-a', 'shield', 0, 2),
      unit('summon', 'wolf', 0),
      unit('enemy', 'wolf', 1),
    ],
    events: [
      { tick: 6, kind: 'damage', source: 'ally-a', target: 'enemy', value: 40 },
      { tick: 7, kind: 'damage', source: 'summon', target: 'enemy', value: 15 },
    ],
  },
];

test('damage stats accumulate only damage from the requested side', () => {
  assert.deepEqual(damageStatsAt(frames, 2, 0), [
    { unitId: 'ally-a', defId: 'shield', star: 2, damage: 40 },
    { unitId: 'ally-b', defId: 'gunner', star: 1, damage: 40 },
    { unitId: 'summon', defId: 'wolf', star: 1, damage: 15 },
  ]);
  assert.deepEqual(damageStatsAt(frames, 2, 1), [
    { unitId: 'enemy', defId: 'wolf', star: 1, damage: 70 },
  ]);
});

test('damage stats rebuild deterministically for replay seeks and limits', () => {
  assert.deepEqual(damageStatsAt(frames, 1, 0, 1), [
    { unitId: 'ally-b', defId: 'gunner', star: 1, damage: 40 },
  ]);
  assert.deepEqual(damageStatsAt(frames, 0, 0), []);
  assert.deepEqual(damageStatsAt([], 3, 0), []);
});
