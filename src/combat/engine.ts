import type {
  BattleDescriptor,
  BattleEvent,
  BattleResult,
  BattleState,
  BattleUnit,
  CombatEntity,
  Tag,
} from '../domain/types';
import { compareId, hashText, hashValue, nextRandom } from '../domain/random';
import { CONTENT_HASH, ITEM_BY_ID, RULES, SYNERGIES, UNIT_BY_ID } from '../content';
export function synergyCounts(units: Pick<BattleUnit, 'defId'>[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of new Set(units.map((u) => u.defId)))
    for (const tag of UNIT_BY_ID[id].tags) counts[tag] = (counts[tag] ?? 0) + 1;
  return counts;
}
function synergyValue(counts: Record<string, number>, tag: Tag): number {
  const definition = SYNERGIES.find((s) => s.id === tag)!;
  let value = 0;
  definition.thresholds.forEach((threshold, index) => {
    if ((counts[tag] ?? 0) >= threshold) value = definition.values[index];
  });
  return value;
}
function entity(unit: BattleUnit, side: 0 | 1, counts: Record<string, number>): CombatEntity {
  const def = UNIT_BY_ID[unit.defId];
  const scale = RULES.starScale[unit.star - 1];
  const modifiers = {
    hpPercent: 0,
    attackPercent: 0,
    armor: 0,
    energy: 0,
    shield: 0,
    haste: 0,
    skillBonus: 0,
    deathHeal: 0,
  };
  for (const tag of def.tags) {
    const synergy = SYNERGIES.find((s) => s.id === tag)!;
    modifiers[synergy.effect] += synergyValue(counts, tag);
  }
  let hp = Math.floor((def.hp * scale) / 100),
    attack = Math.floor((def.attack * scale) / 100),
    armor = def.armor,
    haste = modifiers.haste,
    life = 0,
    skill = modifiers.skillBonus;
  for (const id of unit.items) {
    const i = ITEM_BY_ID[id];
    hp += i.hp;
    attack += i.attack;
    armor += i.armor;
    haste += i.haste;
    life += i.lifesteal;
    skill += i.skillBonus;
  }
  hp = Math.floor((hp * (100 + modifiers.hpPercent)) / 100);
  attack = Math.floor((attack * (100 + modifiers.attackPercent)) / 100);
  armor += modifiers.armor;
  return {
    id: unit.id,
    defId: unit.defId,
    ownerId: unit.ownerId,
    side,
    star: unit.star,
    summoned: false,
    x: unit.x,
    y: unit.y,
    hp,
    maxHp: hp,
    attack,
    armor,
    range: def.range,
    layer: def.layer,
    targets: def.targets,
    energy: modifiers.energy,
    attackTicks: Math.max(
      RULES.minAttackTicks,
      Math.floor((def.attackTicks * (100 - Math.min(RULES.maxHaste, haste))) / 100),
    ),
    nextAttack: 0,
    nextMove: 0,
    nextSkill: 0,
    targetId: null,
    shield: modifiers.shield,
    stunUntil: 0,
    poisonUntil: 0,
    poisonPower: 0,
    buffUntil: 0,
    buffPower: 0,
    lifesteal: life,
    skillBonus: skill,
    deathAt: null,
    deathTriggered: false,
    deathBurstAt: null,
    action: null,
  };
}
export function createBattle(descriptor: BattleDescriptor): BattleState {
  if (
    descriptor.rulesetId !== RULES.id ||
    descriptor.contentHash !== CONTENT_HASH ||
    descriptor.simulationVersion !== RULES.simulationVersion
  )
    throw new Error('战斗版本不一致');
  if (descriptor.sides.flat().length > RULES.entityCap) throw new Error('战斗实体超过上限');
  const entities = descriptor.sides
    .flatMap((side, index) => {
      const counts = synergyCounts(side);
      return side.map((u) => entity(u, index as 0 | 1, counts));
    })
    .sort((a, b) => compareId(a.id, b.id));
  if (new Set(entities.map((e) => e.id)).size !== entities.length)
    throw new Error('重复战斗实体编号');
  const s: BattleState = {
    descriptor,
    tick: 0,
    rng: descriptor.seed,
    entities,
    done: false,
    serial: 0,
    actionSerial: 0,
    entries: [],
    diagnostics: [],
    eventHash: 2166136261,
  };
  for (const u of entities)
    if (UNIT_BY_ID[u.defId].assassin) {
      const enemies = entities.filter((e) => e.side !== u.side);
      const target = enemies.sort((a, b) =>
        u.side === 0 ? a.y - b.y || compareId(a.id, b.id) : b.y - a.y || compareId(a.id, b.id),
      )[0];
      if (target) {
        const fromX = u.x,
          fromY = u.y;
        const cells = neighbors(target.x, target.y).filter(
          ([x, y]) => !occupied(s, u.layer, x, y, u.id),
        );
        if (cells.length) {
          u.x = cells[0][0];
          u.y = cells[0][1];
          s.entries.push({ source: u.id, fromX, fromY });
        }
      }
    }
  s.done = entities.every((e) => e.side === 0) || entities.every((e) => e.side === 1);
  return s;
}
export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}
function neighbors(x: number, y: number): [number, number][] {
  return [
    [0, -1],
    [-1, 0],
    [1, 0],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]
    .map(([dx, dy]) => [x + dx, y + dy] as [number, number])
    .filter(([a, b]) => a >= 0 && a < 10 && b >= 0 && b < 10);
}
function alive(u: CombatEntity): boolean {
  return u.hp > 0;
}
function occupied(s: BattleState, layer: string, x: number, y: number, id: string): boolean {
  return s.entities.some(
    (e) => alive(e) && e.id !== id && e.layer === layer && e.x === x && e.y === y,
  );
}
export function findStep(
  s: BattleState,
  u: CombatEntity,
  target: CombatEntity,
): [number, number] | null {
  const blocked = new Uint8Array(100);
  for (const e of s.entities)
    if (alive(e) && e.id !== u.id && e.layer === u.layer) blocked[e.y * 10 + e.x] = 1;
  const start = u.y * 10 + u.x,
    prev = new Int16Array(100).fill(-1),
    queue = [start];
  prev[start] = start;
  for (let head = 0; head < queue.length; head++) {
    const cell = queue[head],
      x = cell % 10,
      y = Math.floor(cell / 10);
    if (cell !== start && distance({ x, y }, target) <= u.range) {
      let next = cell;
      while (prev[next] !== start) next = prev[next];
      return [next % 10, Math.floor(next / 10)];
    }
    for (const [nx, ny] of neighbors(x, y)) {
      const key = ny * 10 + nx;
      if (prev[key] !== -1 || blocked[key]) continue;
      if (
        u.layer === 'ground' &&
        nx !== x &&
        ny !== y &&
        (blocked[y * 10 + nx] || blocked[ny * 10 + x])
      )
        continue;
      prev[key] = cell;
      queue.push(key);
    }
  }
  return null;
}
interface Hit {
  source: CombatEntity;
  target: CombatEntity;
  power: number;
  physical: boolean;
}
export function stepBattle(s: BattleState, steps = 1): BattleEvent[] {
  const events: BattleEvent[] = [];
  const emit = (event: Omit<BattleEvent, 'tick'>) => {
    const e = { tick: s.tick, ...event };
    events.push(e);
    s.eventHash = hashText(JSON.stringify(e), s.eventHash);
  };
  const applyHit = (hit: Hit) => {
    const { source, target, physical } = hit;
    let damage = Math.max(
      1,
      physical
        ? Math.floor(
            (hit.power * RULES.damageArmorBase) /
              (RULES.damageArmorBase + Math.max(0, target.armor) * RULES.armorCoefficient),
          )
        : hit.power,
    );
    const absorbed = Math.min(target.shield, damage);
    target.shield -= absorbed;
    damage -= absorbed;
    if (absorbed)
      emit({ kind: 'shieldAbsorb', source: source.id, target: target.id, value: absorbed });
    if (absorbed && !target.shield)
      emit({ kind: 'shieldBreak', source: source.id, target: target.id });
    target.hp -= damage;
    if (target.deathAt !== null && s.tick < target.deathAt) target.hp = Math.max(1, target.hp);
    target.energy = Math.min(100, target.energy + RULES.hitEnergy);
    emit({ kind: 'damage', source: source.id, target: target.id, value: damage });
    if (physical && source.lifesteal && source.hp > 0) {
      const heal = Math.min(
        source.maxHp - source.hp,
        Math.floor((damage * source.lifesteal) / 100),
      );
      source.hp += heal;
      if (heal) emit({ kind: 'heal', source: source.id, target: source.id, value: heal });
    }
  };
  const eventForAction = (kind: BattleEvent['kind'], source: CombatEntity) => {
    const action = source.action!;
    emit({
      kind,
      source: source.id,
      target: action.targetId,
      x: action.targetX,
      y: action.targetY,
      actionId: action.id,
      action: action.kind,
      skillKind: action.skillKind,
      releaseTick: action.releaseAt,
      impactTick: action.impactAt,
      recoverTick: action.recoverAt,
    });
  };
  const startAction = (source: CombatEntity, kind: 'attack' | 'skill', target: CombatEntity) => {
    const def = UNIT_BY_ID[source.defId],
      baseTiming = kind === 'attack' ? def.attackTiming : def.skill.timing,
      scale = kind === 'attack' ? source.attackTicks / def.attackTicks : 1,
      windup = Math.max(1, Math.floor(baseTiming.windupTicks * scale)),
      travel = Math.max(0, Math.floor(baseTiming.travelTicks * scale)),
      recovery = Math.max(0, Math.floor(baseTiming.recoveryTicks * scale));
    let actualTarget = target;
    if (kind === 'skill' && def.skill.kind === 'heal') {
      actualTarget =
        s.entities
          .filter((e) => e.side === source.side && alive(e))
          .sort((a, b) => a.hp * b.maxHp - b.hp * a.maxHp || compareId(a.id, b.id))[0] ?? source;
    } else if (kind === 'skill' && ['shield', 'buff', 'summon'].includes(def.skill.kind)) {
      actualTarget = source;
    }
    let power = source.attack,
      critical = false;
    if (kind === 'attack') {
      s.rng = nextRandom(s.rng);
      critical = !!def.assassin && s.rng % 100 < 20;
      power = Math.floor(
        ((source.attack + (source.buffUntil > s.tick ? source.buffPower : 0)) *
          (critical ? 150 : 100)) /
          100,
      );
      source.energy = Math.min(100, source.energy + RULES.attackEnergy);
      source.nextAttack = s.tick + source.attackTicks;
    } else {
      source.energy -= 100;
      source.nextSkill = s.tick + def.skill.cooldown;
      power = Math.floor(
        (((def.skill.power * RULES.starScale[source.star - 1]) / 100) * (100 + source.skillBonus)) /
          100,
      );
    }
    source.action = {
      id: ++s.actionSerial,
      kind,
      skillKind: kind === 'skill' ? def.skill.kind : undefined,
      targetId: actualTarget.id,
      targetX: actualTarget.x,
      targetY: actualTarget.y,
      startedAt: s.tick,
      releaseAt: s.tick + windup,
      impactAt: s.tick + windup + travel,
      recoverAt: s.tick + windup + travel + recovery,
      released: false,
      power,
      physical: kind === 'attack',
      critical,
    };
    eventForAction('actionStart', source);
  };
  const impactAction = (source: CombatEntity, hits: Hit[]) => {
    const action = source.action!,
      def = UNIT_BY_ID[source.defId];
    eventForAction('actionImpact', source);
    if (action.critical)
      emit({ kind: 'critical', source: source.id, target: action.targetId, actionId: action.id });
    if (action.kind === 'attack') {
      const target = s.entities.find((e) => e.id === action.targetId && alive(e));
      if (target) hits.push({ source, target, power: action.power, physical: action.physical });
      return;
    }
    const skill = def.skill,
      friends = s.entities.filter((e) => e.side === source.side && alive(e));
    if (skill.kind === 'heal') {
      const target = s.entities.find((e) => e.id === action.targetId && alive(e));
      if (target) {
        const heal = Math.min(action.power, target.maxHp - target.hp);
        target.hp += heal;
        if (heal) emit({ kind: 'heal', source: source.id, target: target.id, value: heal });
      }
    } else if (skill.kind === 'shield') {
      if (alive(source)) {
        source.shield += action.power;
        emit({ kind: 'shield', source: source.id, target: source.id, value: action.power });
        emit({ kind: 'statusApply', source: source.id, target: source.id, status: 'shield' });
      }
    } else if (skill.kind === 'buff') {
      if (source.defId === 'child') {
        for (const friend of friends) {
          friend.energy = Math.min(100, friend.energy + 35);
          emit({ kind: 'statusApply', source: source.id, target: friend.id, status: 'energy' });
        }
      } else if (alive(source)) {
        source.buffPower = Math.floor(source.attack / 2);
        source.buffUntil = s.tick + skill.duration;
        emit({
          kind: 'statusApply',
          source: source.id,
          target: source.id,
          status: 'buff',
          until: source.buffUntil,
        });
      }
    } else if (skill.kind === 'summon') {
      if (alive(source) && s.entities.length < RULES.entityCap) {
        const cell = neighbors(source.x, source.y).find(
          ([x, y]) => !occupied(s, 'ground', x, y, ''),
        );
        if (cell) {
          const child = entity(
            {
              id: `${s.descriptor.id}:s${++s.serial}`,
              defId: 'wolf',
              ownerId: source.ownerId,
              star: source.star,
              x: cell[0],
              y: cell[1],
              items: [],
            },
            source.side,
            {},
          );
          child.summoned = true;
          child.maxHp = child.hp = Math.floor(source.maxHp / 3);
          child.attack = Math.floor(source.attack / 2);
          s.entities.push(child);
          emit({ kind: 'spawn', source: source.id, target: child.id, x: child.x, y: child.y });
        }
      } else if (s.entities.length >= RULES.entityCap && !s.diagnostics.includes('entity-cap')) {
        s.diagnostics.push('entity-cap');
      }
    } else {
      if (skill.kind === 'dash' && alive(source)) {
        const cell = neighbors(action.targetX, action.targetY).find(
          ([x, y]) => !occupied(s, source.layer, x, y, source.id),
        );
        if (cell) {
          source.x = cell[0];
          source.y = cell[1];
          emit({ kind: 'move', source: source.id, x: source.x, y: source.y });
        }
      }
      for (const target of s.entities.filter(
        (e) =>
          alive(e) &&
          e.side !== source.side &&
          source.targets.includes(e.layer) &&
          distance(e, { x: action.targetX, y: action.targetY }) <= skill.radius,
      )) {
        hits.push({ source, target, power: action.power, physical: false });
        if (skill.kind === 'stun') {
          target.stunUntil = Math.max(target.stunUntil, s.tick + skill.duration);
          emit({
            kind: 'statusApply',
            source: source.id,
            target: target.id,
            status: 'stun',
            until: target.stunUntil,
          });
        }
        if (skill.kind === 'poison') {
          target.poisonUntil = s.tick + skill.duration;
          target.poisonPower = Math.floor(action.power / 4);
          emit({
            kind: 'statusApply',
            source: source.id,
            target: target.id,
            status: 'poison',
            until: target.poisonUntil,
          });
        }
      }
    }
  };
  for (let step = 0; step < steps && !s.done; step++) {
    s.tick++;
    const hits: Hit[] = [];
    if (s.tick === 1)
      for (const entry of s.entries)
        emit({ kind: 'entry', source: entry.source, x: entry.fromX, y: entry.fromY });
    for (const u of s.entities) {
      if (u.deathAt !== null && s.tick >= u.deathAt && u.hp > 0) {
        u.hp = 0;
        emit({ kind: 'statusRemove', source: u.id, target: u.id, status: 'linger' });
        emit({ kind: 'death', source: u.id, x: u.x, y: u.y });
      }
      if (u.stunUntil === s.tick)
        emit({ kind: 'statusRemove', source: u.id, target: u.id, status: 'stun' });
      if (u.poisonUntil === s.tick)
        emit({ kind: 'statusRemove', source: u.id, target: u.id, status: 'poison' });
      if (u.buffUntil === s.tick)
        emit({ kind: 'statusRemove', source: u.id, target: u.id, status: 'buff' });
      if (u.poisonUntil > s.tick && s.tick % 20 === 0 && alive(u))
        hits.push({ source: u, target: u, power: u.poisonPower, physical: false });
      if (u.deathBurstAt === s.tick) {
        const power = UNIT_BY_ID[u.defId].deathBurst ?? 0;
        emit({ kind: 'deathBurstImpact', source: u.id, x: u.x, y: u.y, value: power });
        for (const target of s.entities.filter(
          (e) => alive(e) && e.side !== u.side && distance(e, u) <= 1,
        ))
          hits.push({ source: u, target, power, physical: false });
        u.deathBurstAt = null;
      }
    }
    const acting = [...s.entities].sort((a, b) => compareId(a.id, b.id));
    for (const u of acting) {
      const action = u.action;
      if (!action) continue;
      if (!action.released && (!alive(u) || u.stunUntil > s.tick)) {
        eventForAction('actionCancel', u);
        u.action = null;
        continue;
      }
      if (!action.released && s.tick >= action.releaseAt) {
        action.released = true;
        eventForAction('actionRelease', u);
      }
      if (action.released && s.tick === action.impactAt) impactAction(u, hits);
      if (s.tick >= action.recoverAt && s.tick >= action.impactAt) u.action = null;
    }
    for (const hit of hits) applyHit(hit);
    let triggers = 0,
      changed = true;
    while (changed && triggers < RULES.triggerCap) {
      changed = false;
      for (const u of s.entities) {
        if (u.hp > 0 || u.deathTriggered) continue;
        u.deathTriggered = true;
        changed = true;
        triggers++;
        const def = UNIT_BY_ID[u.defId];
        if (def.linger && !u.summoned) {
          u.hp = 1;
          u.deathAt = s.tick + def.linger;
          emit({
            kind: 'statusApply',
            source: u.id,
            target: u.id,
            status: 'linger',
            until: u.deathAt,
          });
        }
        if (def.deathBurst && !u.summoned) {
          u.deathBurstAt = s.tick + 3;
          emit({
            kind: 'deathBurst',
            source: u.id,
            x: u.x,
            y: u.y,
            value: def.deathBurst,
            impactTick: u.deathBurstAt,
          });
        }
        const support = synergyValue(synergyCounts(s.descriptor.sides[u.side]), 'support');
        if (support && def.tags.includes('support') && !u.summoned)
          for (const friend of s.entities.filter((e) => alive(e) && e.side === u.side)) {
            const heal = Math.min(friend.maxHp - friend.hp, support);
            friend.hp += heal;
            if (heal) emit({ kind: 'heal', source: u.id, target: friend.id, value: heal });
          }
        if (u.hp <= 0) emit({ kind: 'death', source: u.id, x: u.x, y: u.y });
      }
    }
    if (triggers >= RULES.triggerCap && !s.diagnostics.includes('trigger-cap'))
      s.diagnostics.push('trigger-cap');
    for (const u of s.entities) {
      if (u.hp < 0) u.hp = 0;
      if (u.action && !u.action.released && (!alive(u) || u.stunUntil > s.tick)) {
        eventForAction('actionCancel', u);
        u.action = null;
      }
    }
    const living = s.entities.filter(alive).sort((a, b) => compareId(a.id, b.id));
    for (const u of living) {
      if (u.action || u.stunUntil > s.tick) continue;
      const enemies = living.filter(
        (e) => e.side !== u.side && u.targets.includes(e.layer) && alive(e),
      );
      let target = enemies.find((e) => e.id === u.targetId);
      if (!target)
        target = enemies.sort(
          (a, b) =>
            (distance(u, a) <= u.range ? 0 : 1) - (distance(u, b) <= u.range ? 0 : 1) ||
            distance(u, a) - distance(u, b) ||
            compareId(a.id, b.id),
        )[0];
      if (!target) continue;
      u.targetId = target.id;
      if (!u.summoned && u.energy >= 100 && s.tick >= u.nextSkill) {
        startAction(u, 'skill', target);
      } else if (distance(u, target) <= u.range && s.tick >= u.nextAttack) {
        startAction(u, 'attack', target);
      } else if (distance(u, target) > u.range && s.tick >= u.nextMove) {
        const def = UNIT_BY_ID[u.defId];
        let cell = findStep(s, u, target);
        if (!cell) {
          for (const alternate of enemies.sort(
            (a, b) => distance(u, a) - distance(u, b) || compareId(a.id, b.id),
          )) {
            cell = findStep(s, u, alternate);
            if (cell) {
              u.targetId = alternate.id;
              break;
            }
          }
        }
        if (cell) {
          u.x = cell[0];
          u.y = cell[1];
          emit({ kind: 'move', source: u.id, x: u.x, y: u.y });
        }
        u.nextMove = s.tick + def.moveTicks;
      }
    }
    const aliveSides = new Set(s.entities.filter(alive).map((u) => u.side));
    const pendingImpact = s.entities.some(
      (u) =>
        (u.action?.released && u.action.impactAt > s.tick) ||
        (u.deathBurstAt !== null && u.deathBurstAt > s.tick),
    );
    s.done = (aliveSides.size < 2 && !pendingImpact) || s.tick >= RULES.maxTicks;
  }
  return events;
}
export function finishBattle(s: BattleState): BattleResult {
  if (!s.done) throw new Error('Battle is not finished');
  const survivors = s.entities.filter(alive).sort((a, b) => compareId(a.id, b.id));
  const sides = new Set(survivors.map((u) => u.side));
  const winner = sides.size === 1 ? survivors[0].side : null;
  const damage: [number, number] =
    winner === null
      ? [1, 1]
      : winner === 0
        ? [0, survivors.filter((u) => !u.summoned).reduce((n, u) => n + u.star, 0)]
        : [survivors.filter((u) => !u.summoned).reduce((n, u) => n + u.star, 0), 0];
  return {
    id: s.descriptor.id,
    winner,
    ticks: s.tick,
    damage,
    survivors: survivors.map((u) => u.id),
    hash: hashValue({ tick: s.tick, rng: s.rng, entities: s.entities, eventHash: s.eventHash }),
    diagnostics: s.diagnostics,
  };
}
export function simulateBattle(descriptor: BattleDescriptor): BattleResult {
  const s = createBattle(descriptor);
  while (!s.done) stepBattle(s, 40);
  return finishBattle(s);
}
export { SYNERGIES };
