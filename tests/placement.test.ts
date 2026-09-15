import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assessPlacement, type PlacementIntent } from '../src/domain/placement';
import { PLACEMENT_LIMITS } from '../src/content';
import { createGame, addPlayer, applyCommand, assertInvariants } from '../src/rules/game';
import type { Position } from '../src/domain/types';

test('placement preview matches authority across owners, zones and both command types', () => {
  const positions: Position[] = [
    { zone: 'bench', slot: 0 },
    { zone: 'board', x: 0, y: 5 },
    { zone: 'public', slot: 0 },
  ];
  for (const sourceOwner of ['a', 'b'])
    for (const targetOwner of ['a', 'b'])
      for (const source of positions)
        for (const destination of positions)
          for (const kind of ['move', 'swap'] as const) {
            const s = createGame(45);
            addPlayer(s, 'a', 'A', 'team-0', 0);
            addPlayer(s, 'b', 'B', 'team-0', 1);
            s.phase = 'prep';
            s.round = 1;
            const targetPosition: Position =
              destination.zone === 'board' ? { ...destination, x: 1 } : { ...destination, slot: 1 };
            s.units.one = {
              id: 'one',
              defId: 'shield',
              ownerId: sourceOwner,
              teamId: 'team-0',
              star: 1,
              copies: 1,
              items: [],
              version: 0,
              position: source,
            };
            s.pool.shield--;
            if (kind === 'swap') {
              s.units.two = {
                id: 'two',
                defId: 'gunner',
                ownerId: targetOwner,
                teamId: 'team-0',
                star: 1,
                copies: 1,
                items: [],
                version: 0,
                position: targetPosition,
              };
              s.pool.gunner--;
            }
            // This case tests normal legal source states; start with enough population for both.
            s.players.a.level = s.players.b.level = 2;
            s.players.a.exp = s.players.b.exp = 1;
            const intent: PlacementIntent = {
              kind,
              unitId: 'one',
              unitVersion: 0,
              position: targetPosition,
              benchOwnerId: targetOwner,
              targetId: 'two',
              targetVersion: 0,
            };
            const preview = assessPlacement(s, 'a', intent, PLACEMENT_LIMITS);
            const before = structuredClone(s.units);
            const result = applyCommand(s, 'a', {
              ...intent,
              type: kind,
              round: 1,
              commandId: 'matrix',
            });
            assert.equal(
              result.ok,
              preview.ok,
              JSON.stringify({ sourceOwner, targetOwner, source, targetPosition, kind }),
            );
            if (!result.ok) assert.deepEqual(s.units, before);
            assertInvariants(s);
          }
});
test('touch bench destination cannot reinterpret teammate bench as own and public claiming stays explicit', () => {
  const s = createGame(77);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  s.phase = 'prep';
  s.round = 1;
  s.units.one = {
    id: 'one',
    defId: 'shield',
    ownerId: 'a',
    teamId: 'team-0',
    star: 1,
    copies: 1,
    version: 0,
    position: { zone: 'public', slot: 0 },
    items: [],
  };
  s.pool.shield--;
  const intent: PlacementIntent = {
    kind: 'move',
    unitId: 'one',
    unitVersion: 0,
    position: { zone: 'bench', slot: 0 },
    benchOwnerId: 'a',
  };
  assert.equal(assessPlacement(s, 'b', intent, PLACEMENT_LIMITS).ok, false);
  assert.equal(
    applyCommand(s, 'b', { ...intent, type: 'move', round: 1, commandId: 'wrong-bench' }).ok,
    false,
  );
  assert.equal(s.units.one.ownerId, 'a');
  assert.equal(
    applyCommand(s, 'b', {
      ...intent,
      benchOwnerId: 'b',
      type: 'move',
      round: 1,
      commandId: 'receive',
    }).ok,
    true,
  );
  assert.equal(s.units.one.ownerId, 'b');
  assertInvariants(s);
});
