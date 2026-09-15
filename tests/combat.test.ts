import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COMBAT_VISUALS, CONTENT_HASH, RULES, UNIT_BY_ID, UNITS } from '../src/content';
import {
  createBattle,
  finishBattle,
  findStep,
  simulateBattle,
  stepBattle,
} from '../src/combat/engine';
import { buildReplay, frame } from '../src/combat/replay';
import type { BattleDescriptor } from '../src/domain/types';
export function descriptor(count = 8): BattleDescriptor {
  return {
    id: 'test',
    round: 4,
    seed: 12345,
    rulesetId: RULES.id,
    contentHash: CONTENT_HASH,
    simulationVersion: RULES.simulationVersion,
    teams: ['a', 'b'],
    mirror: false,
    neutral: false,
    sides: [0, 1].map((side) =>
      Array.from({ length: count }, (_, i) => ({
        id: `${side}:${i}`,
        defId: UNITS[i % UNITS.length].id,
        ownerId: String(side),
        star: 1 + (i % 3),
        x: i % 8,
        y: side ? 3 - Math.floor(i / 8) : 6 + Math.floor(i / 8),
        items: i % 3 === 0 ? ['blood'] : [],
      })),
    ) as BattleDescriptor['sides'],
  };
}
test('identical seed and arbitrary step batches produce identical event sequence and result', () => {
  const d = descriptor(16),
    a = createBattle(d),
    b = createBattle(d);
  const ea = [],
    eb = [];
  while (!a.done) ea.push(...stepBattle(a, 1));
  while (!b.done) eb.push(...stepBattle(b, 13));
  assert.deepEqual(ea, eb);
  assert.deepEqual(finishBattle(a), finishBattle(b));
  assert.deepEqual(simulateBattle(structuredClone(d)), finishBattle(a));
  assert.equal(buildReplay(d).result.hash, finishBattle(a).hash);
});
test('mutual lethal attacks resolve together', () => {
  const s = createBattle(descriptor(1));
  for (const [i, u] of s.entities.entries()) {
    u.hp = 1;
    u.shield = 0;
    u.x = 4;
    u.y = i ? 5 : 6;
    u.attack = 999;
    u.energy = 0;
  }
  const events = stepBattle(s, 30);
  assert.equal(s.done, true);
  assert.equal(finishBattle(s).winner, null);
  assert.ok(events.some((event) => event.kind === 'actionStart'));
  assert.ok(events.some((event) => event.kind === 'actionRelease'));
  assert.ok(events.some((event) => event.kind === 'actionImpact'));
});
test('timeout and empty sides end deterministically', () => {
  const s = createBattle(descriptor(1));
  for (const u of s.entities) {
    u.targets = [];
    u.hp = 9999;
  }
  stepBattle(s, 900);
  assert.equal(finishBattle(s).winner, null);
  const d = descriptor(0);
  assert.equal(simulateBattle(d).winner, null);
});
test('ground BFS cannot cut occupied diagonal corners', () => {
  const s = createBattle(descriptor(2));
  const u = s.entities[0],
    enemy = s.entities.find((e) => e.side === 1)!;
  u.x = 0;
  u.y = 0;
  u.range = 1;
  enemy.x = 2;
  enemy.y = 2;
  const others = s.entities.filter((e) => e !== u && e !== enemy);
  others[0].x = 1;
  others[0].y = 0;
  others[1].x = 0;
  others[1].y = 1;
  assert.equal(findStep(s, u, enemy), null);
  u.layer = 'air';
  assert.notEqual(findStep(s, u, enemy), null);
});
test('all configured skills execute and summons obey entity cap', () => {
  const d = descriptor(3);
  for (const side of d.sides) {
    side[0].defId = 'wolf';
    side[1].defId = 'medic';
    side[2].defId = 'kong';
  }
  const s = createBattle(d);
  for (const u of s.entities) u.energy = 100;
  const events = stepBattle(s, 900);
  assert.ok(events.some((e) => e.kind === 'spawn'));
  assert.ok(events.some((e) => e.kind === 'heal'));
  assert.ok(events.some((e) => e.kind === 'shield'));
  assert.ok(s.entities.length <= RULES.entityCap);
  assert.ok(s.done);
});
test('air targeting restrictions are respected', () => {
  const s = createBattle(descriptor(1));
  s.entities[0].targets = ['ground'];
  s.entities[1].layer = 'air';
  s.entities[1].targets = [];
  stepBattle(s, 40);
  assert.equal(s.entities[1].hp, s.entities[1].maxHp);
});
test('delayed death survives subsequent hits until its deterministic expiry', () => {
  const d = descriptor(2);
  d.sides[0][0].defId = 'bone_dragon';
  d.sides[0][1].defId = 'vine';
  const s = createBattle(d),
    u = s.entities[0],
    enemy = s.entities.find((entity) => entity.side === 1)!;
  const companion = s.entities.find((entity) => entity.side === 0 && entity !== u)!;
  companion.hp = 0;
  companion.deathTriggered = true;
  u.hp = 1;
  u.shield = 0;
  u.attack = 0;
  u.energy = 0;
  u.x = 4;
  u.y = 6;
  enemy.x = 4;
  enemy.y = 5;
  enemy.attack = 10000;
  enemy.attackTicks = 1;
  enemy.hp = 999999;
  while (u.deathAt === null) stepBattle(s);
  const expiry = u.deathAt;
  assert.equal(u.hp, 1);
  assert.ok(expiry !== null && expiry > s.tick);
  stepBattle(s, Math.floor((expiry! - s.tick) / 2));
  assert.equal(u.hp, 1);
  stepBattle(s, expiry! - s.tick);
  assert.equal(u.hp, 0);
  assert.equal(finishBattle(s).winner, 1);
});

test('control cancels an unreleased action without refunding its cadence', () => {
  const s = createBattle(descriptor(1)),
    source = s.entities[1];
  source.action = {
    id: 99,
    kind: 'attack',
    targetId: s.entities[0].id,
    targetX: s.entities[0].x,
    targetY: s.entities[0].y,
    startedAt: 0,
    releaseAt: 5,
    impactAt: 8,
    recoverAt: 10,
    released: false,
    power: 999,
    physical: true,
    critical: false,
  };
  source.nextAttack = 20;
  source.stunUntil = 4;
  const events = stepBattle(s);
  assert.equal(source.action, null);
  assert.equal(source.nextAttack, 20);
  assert.ok(events.some((event) => event.kind === 'actionCancel' && event.actionId === 99));
});

test('a released projectile survives its source and resolves at its deterministic impact tick', () => {
  const s = createBattle(descriptor(1)),
    source = s.entities[0],
    target = s.entities[1];
  source.hp = 0;
  source.deathTriggered = true;
  source.action = {
    id: 77,
    kind: 'attack',
    targetId: target.id,
    targetX: target.x,
    targetY: target.y,
    startedAt: 0,
    releaseAt: 0,
    impactAt: 2,
    recoverAt: 3,
    released: true,
    power: 100,
    physical: true,
    critical: false,
  };
  const hp = target.hp;
  stepBattle(s, 2);
  assert.ok(target.hp < hp);
});

test('area skills hit occupants at the warned ground position on impact', () => {
  const d = descriptor(2);
  d.sides[0][0].defId = 'grenadier';
  const s = createBattle(d),
    caster = s.entities.find((unit) => unit.id === '0:0')!,
    original = s.entities.find((unit) => unit.id === '1:0')!,
    replacement = s.entities.find((unit) => unit.id === '1:1')!;
  caster.energy = 100;
  caster.x = 4;
  caster.y = 6;
  original.x = 4;
  original.y = 4;
  replacement.x = 9;
  replacement.y = 9;
  for (const ally of s.entities.filter((unit) => unit.side === 0 && unit !== caster))
    ally.targets = [];
  original.targets = [];
  replacement.targets = [];
  stepBattle(s);
  const action = caster.action!;
  assert.equal(action.kind, 'skill');
  const originalHp = original.hp,
    replacementHp = replacement.hp;
  original.x = 0;
  original.y = 0;
  replacement.x = action.targetX;
  replacement.y = action.targetY;
  stepBattle(s, action.impactAt - s.tick);
  assert.equal(original.hp, originalHp);
  assert.ok(replacement.hp < replacementHp);
});

test('all units have unique complete combat visual profiles', () => {
  assert.equal(Object.keys(COMBAT_VISUALS).length, UNITS.length);
  assert.equal(new Set(UNITS.map((unit) => unit.combatVisual.attack)).size, UNITS.length);
  assert.equal(new Set(UNITS.map((unit) => unit.combatVisual.skill)).size, UNITS.length);
  for (const unit of UNITS) {
    assert.ok(unit.attackTiming.windupTicks > 0);
    assert.ok(unit.skill.timing.windupTicks > 0);
    assert.ok(unit.combatVisual.primary > 0);
    assert.ok(unit.combatVisual.secondary > 0);
  }
});

test('replay frames retain active actions and released projectiles after their source dies', () => {
  const s = createBattle(descriptor(1)),
    source = s.entities[0];
  source.x = 4;
  source.y = 5;
  s.entities[1].x = 4;
  s.entities[1].y = 4;
  stepBattle(s);
  assert.ok(frame(s).units.find((unit) => unit.id === source.id)?.action);
  source.action!.released = true;
  source.action!.impactAt = s.tick + 2;
  source.hp = 0;
  const snapshot = frame(s);
  assert.equal(
    snapshot.units.some((unit) => unit.id === source.id),
    false,
  );
  assert.equal(
    snapshot.actions.some((action) => action.sourceId === source.id),
    true,
  );
});

test('burstbug death burst warns before its delayed deterministic explosion', () => {
  const d = descriptor(1);
  d.sides[0][0].defId = 'burstbug';
  const s = createBattle(d),
    bug = s.entities[0],
    enemy = s.entities[1];
  bug.x = 4;
  bug.y = 5;
  enemy.x = 4;
  enemy.y = 4;
  enemy.targets = [];
  bug.hp = 0;
  const warning = stepBattle(s).find((event) => event.kind === 'deathBurst');
  assert.ok(warning?.impactTick && warning.impactTick > warning.tick);
  assert.equal(frame(s).deathBursts[0]?.impactAt, warning!.impactTick);
  const hp = enemy.hp;
  stepBattle(s, warning!.impactTick! - s.tick - 1);
  assert.equal(enemy.hp, hp);
  const impact = stepBattle(s);
  assert.ok(impact.some((event) => event.kind === 'deathBurstImpact'));
  assert.ok(enemy.hp < hp);
});

test('behavioral synergies initialize deterministic combat modifiers', () => {
  const d = descriptor(4);
  ['bomber', 'repair', 'ark', 'ghost'].forEach((id, index) => (d.sides[0][index].defId = id));
  ['sage', 'child', 'turtle', 'master'].forEach((id, index) => (d.sides[1][index].defId = id));
  const s = createBattle(d);
  assert.ok(s.entities.filter((unit) => unit.side === 0).every((unit) => unit.dodge === 25));
  assert.ok(
    s.entities
      .filter((unit) => unit.side === 1 && UNIT_BY_ID[unit.defId].tags.includes('psionic'))
      .every((unit) => unit.reflect === 35),
  );
});

test('execute, armor break, charm and item disabling emit their configured effects', () => {
  const d = descriptor(4);
  ['athena', 'venom', 'spider', 'divine_tower'].forEach(
    (id, index) => (d.sides[0][index].defId = id),
  );
  const s = createBattle(d);
  for (const unit of s.entities.filter((value) => value.side === 0)) unit.energy = 100;
  const events = stepBattle(s, 80);
  assert.ok(events.some((event) => event.status === 'armorBreak'));
  assert.ok(events.some((event) => event.status === 'taunt'));
  assert.ok(events.some((event) => event.status === 'itemsDisabled'));
});

test('a non-attacking building neither walks nor starts attacks', () => {
  const d = descriptor(1);
  d.sides[0][0].defId = 'alchemy_tower';
  const s = createBattle(d),
    tower = s.entities[0],
    start = [tower.x, tower.y];
  stepBattle(s, 100);
  assert.deepEqual([tower.x, tower.y], start);
  assert.equal(tower.action, null);
});
