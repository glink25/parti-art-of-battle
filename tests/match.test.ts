import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addPlayer, createGame, assertInvariants } from '../src/rules/game';
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
