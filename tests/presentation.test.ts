import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addPlayer, createGame } from '../src/rules/game';
import { battlePresentationUnits } from '../src/client/presentation';
import type { ReplayFrame } from '../src/combat/replay';

test('battle presentation combines replay combatants with live reserve and public units', () => {
  const s = createGame(91);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  s.units = {
    field: {
      id: 'field',
      defId: 'shield',
      ownerId: 'a',
      teamId: 'team-0',
      star: 1,
      copies: 1,
      version: 0,
      position: { zone: 'board', x: 0, y: 5 },
      items: [],
    },
    bench: {
      id: 'bench',
      defId: 'gunner',
      ownerId: 'a',
      teamId: 'team-0',
      star: 1,
      copies: 1,
      version: 0,
      position: { zone: 'bench', slot: 0 },
      items: [],
    },
    public: {
      id: 'public',
      defId: 'dog',
      ownerId: 'b',
      teamId: 'team-0',
      star: 1,
      copies: 1,
      version: 0,
      position: { zone: 'public', slot: 0 },
      items: [],
    },
  };
  const frame: ReplayFrame = {
    battleId: 'battle',
    tick: 0,
    actions: [],
    deathBursts: [],
    events: [],
    units: [
      {
        id: 'battle:0:field',
        defId: 'shield',
        side: 0,
        star: 1,
        x: 0,
        y: 5,
        hp: 100,
        maxHp: 100,
        shield: 0,
        layer: 'ground',
        stunUntil: 0,
        poisonUntil: 0,
        buffUntil: 0,
        deathAt: null,
        action: null,
      },
      {
        id: 'battle:1:enemy',
        defId: 'wolf',
        side: 1,
        star: 1,
        x: 9,
        y: 4,
        hp: 100,
        maxHp: 100,
        shield: 0,
        layer: 'ground',
        stunUntil: 0,
        poisonUntil: 0,
        buffUntil: 0,
        deathAt: null,
        action: null,
      },
    ],
  };
  const shown = battlePresentationUnits(s, 'team-0', frame);
  assert.deepEqual(
    shown.map((unit) => unit.id),
    ['battle:0:field', 'battle:1:enemy', 'bench', 'public'],
  );
  assert.equal(
    shown.some((unit) => unit.id === 'field'),
    false,
  );
});
