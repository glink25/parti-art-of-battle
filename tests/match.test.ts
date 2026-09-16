import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addPlayer, applyCommand, createGame, assertInvariants } from '../src/rules/game';
import {
  startMatch,
  freezeBattles,
  commitBattleResults,
  settleRound,
} from '../src/match/lifecycle';
import { simulateBattle } from '../src/combat/engine';
import { advanceBots } from '../src/bots/planner';
test('eight-team round has atomic idempotent settlement and bounded legal bots', () => {
  const s = createGame(33);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  startMatch(s);
  let n = 0;
  while (advanceBots(s, true)) {
    assert.ok(++n <= 384);
    assertInvariants(s);
  }
  assert.equal(Object.keys(s.teams).length, 8);
  freezeBattles(s);
  assert.equal(s.battles.length, 8);
  assert.throws(() => settleRound(s));
  commitBattleResults(s, s.battles.map(simulateBattle));
  settleRound(s);
  const before = structuredClone(s);
  settleRound(s);
  assert.deepEqual(s, before);
  assertInvariants(s);
});
test('odd team mirror has no second economic or damage settlement for source', () => {
  const s = createGame(42);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  startMatch(s);
  s.round = 4;
  s.teams['team-7'].hp = 0;
  s.teams['team-7'].eliminatedRound = 3;
  freezeBattles(s);
  assert.equal(s.battles.length, 4);
  assert.equal(s.battles.filter((b) => b.mirror).length, 1);
  const appearances = s.battles.flatMap((b) => (b.mirror ? [b.teams[0]] : b.teams));
  assert.equal(new Set(appearances).size, 7);
  assert.equal(appearances.length, 7);
});

test('a surviving alchemy tower grants its owner star-scaled victory gold', () => {
  const s = createGame(77);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  addPlayer(s, 'c', 'C', 'team-1', 0);
  addPlayer(s, 'd', 'D', 'team-1', 1);
  s.phase = 'prep';
  s.round = 4;
  s.units.tower = {
    id: 'tower',
    defId: 'alchemy_tower',
    ownerId: 'a',
    teamId: 'team-0',
    star: 2,
    copies: 3,
    version: 0,
    position: { zone: 'board', x: 0, y: 5 },
    items: [],
  };
  s.pool.alchemy_tower -= 3;
  freezeBattles(s);
  const battle = s.battles[0],
    side = battle.teams[0] === 'team-0' ? 0 : 1;
  const tower = battle.sides[side].find((unit) => unit.defId === 'alchemy_tower')!;
  commitBattleResults(s, [
    {
      id: battle.id,
      winner: side as 0 | 1,
      ticks: 10,
      damage: side === 0 ? [0, 1] : [1, 0],
      survivors: [tower.id],
      hash: 'alchemy',
      diagnostics: [],
    },
  ]);
  settleRound(s);
  assert.equal(s.players.a.gold - s.players.b.gold, 2);
  assert.ok(s.lastSummary.some((line) => line.includes('炼金塔 +2 金')));
});

test('battle economy can merge persistent units without changing the frozen battle', () => {
  const s = createGame(123);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  addPlayer(s, 'c', 'C', 'team-1', 0);
  addPlayer(s, 'd', 'D', 'team-1', 1);
  s.phase = 'prep';
  s.round = 1;
  s.players.a.gold = 10;
  s.units.field = {
    id: 'field',
    defId: 'shield',
    ownerId: 'a',
    teamId: 'team-0',
    star: 1,
    copies: 1,
    version: 0,
    position: { zone: 'board', x: 0, y: 5 },
    items: [],
  };
  s.units.public = {
    id: 'public',
    defId: 'shield',
    ownerId: 'b',
    teamId: 'team-0',
    star: 1,
    copies: 1,
    version: 0,
    position: { zone: 'public', slot: 0 },
    items: [],
  };
  s.pool.shield -= 3;
  s.players.a.shop[0] = 'shield';
  freezeBattles(s);
  const frozen = structuredClone(s.battles);
  const before = s.battles.map(simulateBattle);
  assert.equal(
    applyCommand(s, 'a', {
      commandId: 'battle-buy',
      round: 1,
      type: 'buy',
      slot: 0,
      shopVersion: 0,
    }).ok,
    true,
  );
  assert.deepEqual(s.battles, frozen);
  assert.deepEqual(s.battles.map(simulateBattle), before);
  assert.equal(s.units.public.star, 2);
  assert.equal(s.units.public.ownerId, 'b');
  assert.equal(s.units.field, undefined);
  assertInvariants(s);
});
