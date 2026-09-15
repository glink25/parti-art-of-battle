import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, SYNERGIES, UNIT_BY_ID, UNITS, validateContent } from '../src/content';

test('handbook catalog contains all 62 listed units, 24 synergies and 10 representative items', () => {
  validateContent();
  assert.equal(UNITS.length, 62);
  assert.equal(SYNERGIES.length, 24);
  assert.equal(ITEMS.length, 10);
  for (const name of ['爆裂虫', '骨龙', '须弥鲨', '炼金塔', '麻宫雅典娜', '斗战胜佛'])
    assert.ok(
      UNITS.some((unit) => unit.name === name),
      name,
    );
});

test('corrected units and declarative effects retain their reconstructed identity', () => {
  assert.deepEqual(UNIT_BY_ID.pangolin.tags, ['beast', 'assassin']);
  assert.deepEqual(UNIT_BY_ID.master.tags, ['psionic', 'puppet', 'summoner']);
  assert.deepEqual(UNIT_BY_ID.repair.tags, ['airforce', 'support']);
  assert.equal(UNIT_BY_ID.dog.deathBurst, undefined);
  assert.equal(UNIT_BY_ID.burstbug.deathBurst, 130);
  assert.equal(UNIT_BY_ID.alchemy_tower.noAttack, true);
  for (const unit of UNITS) {
    assert.ok(unit.skill.name);
    assert.ok(unit.skill.description);
    assert.ok(unit.skill.effects.length > 0);
  }
});
