import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  addPlayer,
  applyCommand,
  assertInvariants,
  createGame,
  grantRoundIncome,
  mergeUnits,
  refreshShop,
} from '../src/rules/game';
import type { Command, GameState, UnitInstance } from '../src/domain/types';
function setup() {
  const s = createGame(17);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  s.phase = 'prep';
  s.round = 1;
  s.players.a.gold = 100;
  return s;
}
let serial = 0;
function cmd(s: GameState, actor: string, type: Command['type'], extra: Partial<Command> = {}) {
  return applyCommand(s, actor, { commandId: `test-${++serial}`, round: s.round, type, ...extra });
}
function unit(
  s: GameState,
  id: string,
  owner = 'a',
  position: UnitInstance['position'] = { zone: 'bench', slot: 0 },
) {
  s.pool.shield--;
  s.units[id] = {
    id,
    defId: 'shield',
    ownerId: owner,
    teamId: 'team-0',
    star: 1,
    copies: 1,
    version: 0,
    position,
    items: [],
  };
  return s.units[id];
}
test('shop and repeated refresh preserve shared pool', () => {
  const s = setup();
  for (let i = 0; i < 100; i++) {
    refreshShop(s, s.players.a);
    refreshShop(s, s.players.b);
    assertInvariants(s);
  }
});
test('duplicate purchase and stale shop cannot charge twice', () => {
  const s = setup();
  refreshShop(s, s.players.a);
  const c = {
    commandId: 'same',
    round: 1,
    type: 'buy',
    slot: 0,
    shopVersion: s.players.a.shopVersion,
  };
  assert.equal(applyCommand(s, 'a', c).ok, true);
  const gold = s.players.a.gold;
  assert.equal(applyCommand(s, 'a', c).ok, true);
  assert.equal(s.players.a.gold, gold);
  assert.equal(applyCommand(s, 'a', { ...c, commandId: 'stale' }).ok, false);
  assertInvariants(s);
});
test('invalid full bench purchase rolls back gold shop and pool', () => {
  const s = setup();
  for (let i = 0; i < 8; i++) {
    const u = unit(s, `u${i}`, 'a', { zone: 'bench', slot: i });
    s.pool[u.defId]++;
    u.defId = ['shield', 'gunner', 'dog', 'deer', 'child', 'medic', 'wolf', 'sage'][i];
    s.pool[u.defId]--;
  }
  refreshShop(s, s.players.a);
  const before = structuredClone(s);
  const slot = s.players.a.shop.findIndex(Boolean);
  const result = cmd(s, 'a', 'buy', { slot, shopVersion: s.players.a.shopVersion });
  assert.equal(result.ok, false);
  assert.deepEqual(s.players, before.players);
  assert.deepEqual(s.pool, before.pool);
  assert.deepEqual(s.units, before.units);
  assertInvariants(s);
});
test('public transfer is explicit and concurrent moves reject stale versions', () => {
  const s = setup();
  unit(s, 'one');
  assert.equal(
    cmd(s, 'a', 'move', { unitId: 'one', unitVersion: 0, position: { zone: 'public', slot: 0 } })
      .ok,
    true,
  );
  assert.equal(cmd(s, 'b', 'sell', { unitId: 'one', unitVersion: 1 }).ok, false);
  assert.equal(
    cmd(s, 'b', 'move', { unitId: 'one', unitVersion: 1, position: { zone: 'bench', slot: 0 } }).ok,
    true,
  );
  assert.equal(s.units.one.ownerId, 'b');
  assert.equal(
    cmd(s, 'a', 'move', { unitId: 'one', unitVersion: 1, position: { zone: 'board', x: 0, y: 5 } })
      .ok,
    false,
  );
  assertInvariants(s);
});
test('merge retains board unit and returns real copies on sale', () => {
  const s = setup();
  unit(s, 'z', 'a', { zone: 'board', x: 0, y: 5 });
  unit(s, 'a', 'a', { zone: 'bench', slot: 0 });
  unit(s, 'b', 'a', { zone: 'bench', slot: 1 });
  mergeUnits(s, s.players.a);
  assert.equal(s.units.z.star, 2);
  assert.equal(s.units.z.copies, 3);
  assert.equal(Object.keys(s.units).length, 1);
  assertInvariants(s);
  cmd(s, 'a', 'sell', { unitId: 'z', unitVersion: s.units.z.version });
  assertInvariants(s);
});
test('49 gold win receives five interest before next salary', () => {
  const s = setup();
  s.players.a.gold = 49;
  grantRoundIncome(s.players.a, 4, 'win', false);
  assert.equal(s.players.a.gold, 60);
});
test('population and private permissions are enforced', () => {
  const s = setup();
  unit(s, 'one', 'a', { zone: 'board', x: 0, y: 5 });
  unit(s, 'two', 'a', { zone: 'bench', slot: 0 });
  assert.equal(
    cmd(s, 'a', 'move', { unitId: 'two', unitVersion: 0, position: { zone: 'board', x: 1, y: 5 } })
      .ok,
    false,
  );
  assert.equal(
    cmd(s, 'b', 'move', { unitId: 'two', unitVersion: 0, position: { zone: 'board', x: 2, y: 5 } })
      .ok,
    false,
  );
  assert.equal(
    cmd(s, 'b', 'move', { unitId: 'one', unitVersion: 0, position: { zone: 'board', x: 1, y: 5 } })
      .ok,
    true,
  );
  assertInvariants(s);
});
test('equipping rejects a stale inventory slot and selling returns equipment', () => {
  const s = setup();
  unit(s, 'one');
  unit(s, 'two', 'a', { zone: 'bench', slot: 1 });
  s.players.a.items = ['blade', 'book'];
  assert.equal(
    cmd(s, 'a', 'equip', { unitId: 'one', unitVersion: 0, itemSlot: 0, itemId: 'blade' }).ok,
    true,
  );
  assert.equal(
    cmd(s, 'a', 'equip', { unitId: 'two', unitVersion: 0, itemSlot: 0, itemId: 'blade' }).ok,
    false,
  );
  assert.deepEqual(s.units.two.items, []);
  assert.equal(cmd(s, 'a', 'sell', { unitId: 'one', unitVersion: 1 }).ok, true);
  assert.deepEqual(s.players.a.items, ['book', 'blade']);
  assertInvariants(s);
});
test('full bench can still purchase a completing triple', () => {
  const s = setup();
  for (let i = 0; i < 8; i++) {
    const u = unit(s, `u${i}`, 'a', { zone: 'bench', slot: i });
    if (i > 1) {
      s.pool.shield++;
      u.defId = ['gunner', 'dog', 'deer', 'child', 'medic', 'wolf'][i - 2];
      s.pool[u.defId]--;
    }
  }
  s.players.a.shop[0] = 'shield';
  s.pool.shield--;
  assert.equal(cmd(s, 'a', 'buy', { slot: 0, shopVersion: 0 }).ok, true);
  assert.equal(Object.values(s.units).find((u) => u.defId === 'shield')?.star, 2);
  assertInvariants(s);
});
test('public units do not merge across owners until received', () => {
  const s = setup();
  unit(s, 'one', 'a', { zone: 'bench', slot: 0 });
  unit(s, 'two', 'a', { zone: 'bench', slot: 1 });
  unit(s, 'three', 'b', { zone: 'public', slot: 0 });
  mergeUnits(s, s.players.a);
  assert.equal(Object.keys(s.units).length, 3);
  assert.equal(
    cmd(s, 'a', 'move', { unitId: 'three', unitVersion: 0, position: { zone: 'bench', slot: 2 } })
      .ok,
    true,
  );
  assert.equal(Object.keys(s.units).length, 1);
  assert.equal(Object.values(s.units)[0].star, 2);
  assertInvariants(s);
});

test('swap exchanges own bench units once and preserves pool, resources and versions', () => {
  const s = setup();
  unit(s, 'one', 'a', { zone: 'bench', slot: 0 });
  unit(s, 'two', 'a', { zone: 'bench', slot: 1 });
  s.units.one.items = ['blade'];
  const pool = structuredClone(s.pool),
    players = structuredClone(s.players);
  const c = {
    commandId: 'swap-once',
    type: 'swap',
    round: 1,
    unitId: 'one',
    unitVersion: 0,
    targetId: 'two',
    targetVersion: 0,
  };
  assert.equal(applyCommand(s, 'a', c).ok, true);
  assert.deepEqual(s.units.one.position, { zone: 'bench', slot: 1 });
  assert.deepEqual(s.units.two.position, { zone: 'bench', slot: 0 });
  assert.equal(s.units.one.version, 1);
  assert.equal(s.units.two.version, 1);
  const after = structuredClone(s.units);
  assert.equal(applyCommand(s, 'a', c).ok, true);
  assert.deepEqual(s.units, after);
  assert.deepEqual(s.players, players);
  assert.deepEqual(s.pool, pool);
  assert.deepEqual(s.units.one.items, ['blade']);
  assertInvariants(s);
});
test('full population permits own board to bench swap in either direction', () => {
  for (const reverse of [false, true]) {
    const s = setup();
    unit(s, 'board', 'a', { zone: 'board', x: 2, y: 6 });
    unit(s, 'bench', 'a', { zone: 'bench', slot: 3 });
    assert.equal(s.players.a.level, 1);
    assert.equal(
      cmd(s, 'a', 'swap', {
        unitId: reverse ? 'bench' : 'board',
        unitVersion: 0,
        targetId: reverse ? 'board' : 'bench',
        targetVersion: 0,
      }).ok,
      true,
    );
    assert.deepEqual(s.units.board.position, { zone: 'bench', slot: 3 });
    assert.deepEqual(s.units.bench.position, { zone: 'board', x: 2, y: 6 });
    assert.equal(Object.values(s.units).filter((u) => u.position.zone === 'board').length, 1);
    assertInvariants(s);
  }
});
test('either teammate can exchange allied board positions without transferring ownership', () => {
  for (const actor of ['a', 'b']) {
    const s = setup();
    unit(s, 'one', 'a', { zone: 'board', x: 0, y: 5 });
    unit(s, 'two', 'b', { zone: 'board', x: 5, y: 8 });
    assert.equal(
      cmd(s, actor, 'swap', { unitId: 'one', unitVersion: 0, targetId: 'two', targetVersion: 0 })
        .ok,
      true,
    );
    assert.equal(s.units.one.ownerId, 'a');
    assert.equal(s.units.two.ownerId, 'b');
    assert.deepEqual(s.units.one.position, { zone: 'board', x: 5, y: 8 });
    assert.deepEqual(s.units.two.position, { zone: 'board', x: 0, y: 5 });
    assertInvariants(s);
  }
});
test('either stale swap version, missing target and stale round reject atomically', () => {
  for (const extra of [
    { unitVersion: 1 },
    { targetVersion: 1 },
    { targetId: 'missing' },
    { targetId: 'one' },
    { round: 0 },
  ]) {
    const s = setup();
    unit(s, 'one');
    unit(s, 'two', 'a', { zone: 'bench', slot: 1 });
    const before = structuredClone(s);
    assert.equal(
      cmd(s, 'a', 'swap', {
        unitId: 'one',
        unitVersion: 0,
        targetId: 'two',
        targetVersion: 0,
        ...extra,
      }).ok,
      false,
    );
    assert.deepEqual(s.units, before.units);
    assert.deepEqual(s.players, before.players);
    assert.deepEqual(s.pool, before.pool);
    assertInvariants(s);
  }
});
test('public slots, teammate private units and enemy swaps cannot partially move either unit', () => {
  for (const mode of [
    'public-source',
    'public-target',
    'private-source',
    'private-target',
    'teammate-board-own-bench',
    'enemy',
  ]) {
    const s = setup();
    unit(s, 'one', 'a', { zone: 'board', x: 0, y: 5 });
    unit(s, 'two', 'b', { zone: 'board', x: 1, y: 5 });
    if (mode === 'public-source') s.units.one.position = { zone: 'public', slot: 0 };
    if (mode === 'public-target') s.units.two.position = { zone: 'public', slot: 0 };
    if (mode === 'private-source') {
      s.units.one.ownerId = 'b';
      s.units.one.position = { zone: 'bench', slot: 0 };
    }
    if (mode === 'private-target') s.units.two.position = { zone: 'bench', slot: 0 };
    if (mode === 'teammate-board-own-bench') s.units.one.position = { zone: 'bench', slot: 0 };
    if (mode === 'enemy') {
      addPlayer(s, 'enemy', 'Enemy', 'team-1', 0);
      s.units.two.ownerId = 'enemy';
      s.units.two.teamId = 'team-1';
    }
    const before = structuredClone(s.units);
    assert.equal(
      cmd(s, 'a', 'swap', { unitId: 'one', unitVersion: 0, targetId: 'two', targetVersion: 0 }).ok,
      false,
      mode,
    );
    assert.deepEqual(s.units, before, mode);
    assertInvariants(s);
  }
});
