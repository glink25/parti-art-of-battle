import { assessPlacement, isPosition } from '../domain/placement';
import { PLACEMENT_LIMITS, saleValue } from '../content';
import type {
  Command,
  CommandResult,
  GameState,
  PlayerState,
  Position,
  UnitInstance,
} from '../domain/types';
import { compareId, deriveSeed, nextRandom } from '../domain/random';
import { CONTENT_HASH, ITEMS, RULES, UNITS, UNIT_BY_ID } from '../content';
export function createGame(seed = 20260914): GameState {
  return {
    rulesetId: RULES.id,
    contentHash: CONTENT_HASH,
    simulationVersion: RULES.simulationVersion,
    seed,
    phase: 'waiting',
    round: 0,
    deadline: 0,
    playbackEpoch: 0,
    players: {},
    teams: {},
    units: {},
    pool: Object.fromEntries(UNITS.map((u) => [u.id, u.poolCount])),
    nextUnit: 1,
    battles: [],
    results: {},
    settledRound: 0,
    receipts: {},
    rewardRng: deriveSeed(seed, 'rewards'),
    error: null,
    lastSummary: [],
    botCursor: 0,
  };
}
export function addPlayer(
  state: GameState,
  id: string,
  name: string,
  teamId: string,
  seat: number,
  bot = false,
): void {
  if (state.players[id]) return;
  if (!state.teams[teamId])
    state.teams[teamId] = {
      id: teamId,
      name: teamId === 'team-0' ? '共生小队' : `远征队 ${Number(teamId.split('-')[1]) + 1}`,
      players: [],
      hp: 100,
      wins: 0,
      eliminatedRound: null,
      lastOpponent: null,
      rank: null,
    };
  state.teams[teamId].players.push(id);
  state.players[id] = {
    id,
    name,
    teamId,
    seat,
    bot,
    gold: 0,
    level: 1,
    exp: 0,
    shop: Array(5).fill(null),
    shopVersion: 0,
    shopLocked: false,
    shopRng: deriveSeed(state.seed, `shop:${id}`),
    streak: 0,
    items: [],
    ready: false,
    demand: null,
    botMemory: {
      template: (Number(teamId.split('-')[1]) || 0) % 4,
      commands: 0,
      refreshes: 0,
      serial: 0,
      log: [],
    },
  };
}
export function playerUnits(s: GameState, id: string): UnitInstance[] {
  return Object.values(s.units).filter((u) => u.ownerId === id);
}
export function teamUnits(s: GameState, id: string): UnitInstance[] {
  return Object.values(s.units).filter((u) => u.teamId === id);
}
export function baseIncome(round: number): number {
  return RULES.earlyIncome[round - 1] ?? RULES.baseIncome;
}
export function isNeutral(round: number): boolean {
  return round <= 3 || (round >= 10 && round % 5 === 0);
}
export function addXp(p: PlayerState, amount: number): void {
  p.exp = Math.min(RULES.experience[RULES.maxLevel - 1], p.exp + amount);
  while (p.level < RULES.maxLevel && p.exp >= RULES.experience[p.level]) p.level++;
}
export function returnShop(s: GameState, p: PlayerState): void {
  for (const id of p.shop) if (id) s.pool[id]++;
  p.shop = Array(5).fill(null);
}
export function refreshShop(s: GameState, p: PlayerState): void {
  returnShop(s, p);
  const odds = RULES.shopOdds[p.level - 1];
  for (let slot = 0; slot < 5; slot++) {
    p.shopRng = nextRandom(p.shopRng);
    let roll = p.shopRng % 100,
      cost = 1;
    for (let i = 0; i < 5; i++) {
      if (roll < odds[i]) {
        cost = i + 1;
        break;
      }
      roll -= odds[i];
    }
    const candidates = UNITS.filter((u) => u.cost === cost && s.pool[u.id] > 0);
    const total = candidates.reduce((n, u) => n + s.pool[u.id], 0);
    if (!total) continue;
    p.shopRng = nextRandom(p.shopRng);
    let pick = p.shopRng % total;
    for (const u of candidates) {
      if (pick < s.pool[u.id]) {
        s.pool[u.id]--;
        p.shop[slot] = u.id;
        break;
      }
      pick -= s.pool[u.id];
    }
  }
  p.shopVersion++;
}
export function firstBench(s: GameState, id: string): number {
  const used = playerUnits(s, id)
    .filter((u) => u.position.zone === 'bench')
    .map((u) => (u.position as { slot: number }).slot);
  for (let i = 0; i < RULES.benchSize; i++) if (!used.includes(i)) return i;
  return -1;
}
export const sellValue = saleValue;
export function mergeUnits(s: GameState, p: PlayerState): void {
  let changed = true;
  while (changed) {
    changed = false;
    const units = playerUnits(s, p.id)
      .filter((u) => u.position.zone !== 'public')
      .sort(
        (a, b) =>
          (a.position.zone === 'board' ? 0 : 1) - (b.position.zone === 'board' ? 0 : 1) ||
          compareId(a.id, b.id),
      );
    for (const keeper of units) {
      if (keeper.star >= 3) continue;
      const group = units
        .filter((u) => u.defId === keeper.defId && u.star === keeper.star)
        .slice(0, 3);
      if (group.length < 3) continue;
      const allItems = group.flatMap((u) => u.items);
      keeper.copies = group.reduce((n, u) => n + u.copies, 0);
      keeper.star++;
      keeper.items = allItems.slice(0, RULES.itemSlots);
      p.items.push(...allItems.slice(RULES.itemSlots));
      keeper.version++;
      for (const u of group) if (u.id !== keeper.id) delete s.units[u.id];
      changed = true;
      break;
    }
  }
}
function validPosition(pos: Position | undefined): pos is Position {
  return isPosition(pos, PLACEMENT_LIMITS);
}
function reject(message: string): never {
  throw new Error(message);
}
function mutate(s: GameState, p: PlayerState, c: Command): void {
  if (s.phase !== 'prep') reject('仅准备阶段可操作');
  if (s.teams[p.teamId].hp <= 0) reject('队伍已淘汰');
  if (c.round !== s.round) reject('回合已变化，请重试');
  if (c.type === 'ready') {
    p.ready = !p.ready;
    return;
  }
  if (c.type === 'demand') {
    if (c.defId !== null && !UNITS.some((u) => u.id === c.defId)) reject('未知棋子');
    p.demand = c.defId ?? null;
    return;
  }
  if (c.type === 'lock') {
    p.shopLocked = !p.shopLocked;
    return;
  }
  if (c.type === 'refresh') {
    if (p.gold < RULES.refreshCost) reject('金币不足');
    p.gold -= RULES.refreshCost;
    refreshShop(s, p);
    return;
  }
  if (c.type === 'xp') {
    if (p.gold < RULES.xpCost) reject('金币不足');
    if (p.level === RULES.maxLevel) reject('已达最高等级');
    p.gold -= RULES.xpCost;
    addXp(p, RULES.xpGain);
    return;
  }
  if (c.type === 'buy') {
    if (c.shopVersion !== p.shopVersion) reject('商店已变化');
    if (!Number.isInteger(c.slot) || c.slot! < 0 || c.slot! > 4) reject('货架位置无效');
    const defId = p.shop[c.slot!];
    if (!defId) reject('该棋子已售出');
    const def = UNIT_BY_ID[defId];
    if (p.gold < def.cost) reject('金币不足');
    p.gold -= def.cost;
    p.shop[c.slot!] = null;
    p.shopVersion++;
    const id = `u${String(s.nextUnit++).padStart(6, '0')}`;
    s.units[id] = {
      id,
      defId,
      ownerId: p.id,
      teamId: p.teamId,
      star: 1,
      copies: 1,
      version: 0,
      position: { zone: 'bench', slot: firstBench(s, p.id) },
      items: [],
    };
    mergeUnits(s, p);
    const overflow = playerUnits(s, p.id).find(
      (u) => u.position.zone === 'bench' && u.position.slot === -1,
    );
    if (overflow) {
      const slot = firstBench(s, p.id);
      if (slot < 0) reject('备战区已满');
      overflow.position = { zone: 'bench', slot };
    }
    return;
  }
  const u = s.units[c.unitId ?? ''];
  if (!u || u.teamId !== p.teamId) reject('棋子不存在或不属于本队');
  if (c.unitVersion !== u.version) reject('棋子已被移动或合成');
  if (c.type === 'sell') {
    if (u.ownerId !== p.id || u.position.zone === 'public') reject('只能出售自己的非公共区棋子');
    p.gold += sellValue(u);
    p.items.push(...u.items);
    s.pool[u.defId] += u.copies;
    delete s.units[u.id];
    return;
  }
  if (c.type === 'equip') {
    if (u.ownerId !== p.id || u.position.zone === 'public') reject('只能装备自己的非公共区棋子');
    if (!Number.isInteger(c.itemSlot) || c.itemSlot! < 0 || c.itemSlot! >= p.items.length)
      reject('装备不存在');
    if (u.items.length >= RULES.itemSlots) reject('装备槽已满');
    if (p.items[c.itemSlot!] !== c.itemId) reject('装备背包已变化');
    u.items.push(p.items.splice(c.itemSlot!, 1)[0]);
    u.version++;
    return;
  }
  if (c.type === 'move' || c.type === 'swap') {
    const decision = assessPlacement(
      s,
      p.id,
      {
        kind: c.type,
        unitId: u.id,
        unitVersion: c.unitVersion!,
        position: c.position,
        benchOwnerId: c.benchOwnerId,
        targetId: c.targetId,
        targetVersion: c.targetVersion,
      },
      PLACEMENT_LIMITS,
    );
    if (!decision.ok) reject(decision.reason);
    if (c.type === 'swap') {
      const target = s.units[c.targetId!];
      const old = u.position;
      u.position = target.position;
      target.position = old;
      u.version++;
      target.version++;
      return;
    }
    const pos = c.position!;
    u.ownerId = decision.ownerId!;
    u.position =
      pos.zone === 'board'
        ? { zone: 'board', x: pos.x, y: pos.y }
        : { zone: pos.zone, slot: pos.slot };
    u.version++;
    mergeUnits(s, s.players[u.ownerId]);
    return;
  }
  reject('未知指令');
}
/** Transactional clone only commits after all validations and cascading merges succeed. */
export function applyCommand(s: GameState, actor: string, input: unknown): CommandResult {
  const c = input as Command;
  const id = typeof c?.commandId === 'string' ? c.commandId : '';
  if (!id || id.length > 100) return { commandId: id, ok: false, reason: '指令编号无效' };
  if (!s.players[actor]) return { commandId: id, ok: false, reason: '无操作席位' };
  const old = s.receipts[actor]?.find((r) => r.commandId === id);
  if (old) return old;
  let result: CommandResult;
  try {
    const draft = structuredClone(s);
    mutate(draft, draft.players[actor], c);
    Object.assign(s, draft);
    result = { commandId: id, ok: true, reason: '' };
  } catch (e) {
    result = { commandId: id, ok: false, reason: e instanceof Error ? e.message : '无效指令' };
  }
  const receipts = (s.receipts[actor] ??= []);
  receipts.push(result);
  if (receipts.length > 64) receipts.splice(0, receipts.length - 64);
  return result;
}
export function grantRoundIncome(
  p: PlayerState,
  round: number,
  outcome: 'win' | 'loss' | 'draw',
  neutral: boolean,
): void {
  if (!neutral) {
    if (outcome === 'win') p.gold++;
    p.streak =
      outcome === 'draw'
        ? 0
        : outcome === 'win'
          ? Math.max(0, p.streak) + 1
          : Math.min(0, p.streak) - 1;
    const streak = Math.abs(p.streak);
    p.gold += RULES.streakRewards.reduce(
      (reward, [threshold, value]) => (streak >= threshold ? value : reward),
      0,
    );
  }
  p.gold += Math.min(RULES.interestCap, Math.floor(p.gold / RULES.interestStep));
  p.gold += baseIncome(round + 1);
}
export function grantLoot(s: GameState, p: PlayerState): void {
  s.rewardRng = nextRandom(s.rewardRng);
  if (s.rewardRng % 100 >= RULES.neutralDropChance) return;
  s.rewardRng = nextRandom(s.rewardRng);
  p.items.push(ITEMS[s.rewardRng % ITEMS.length].id);
}
export function assertInvariants(s: GameState): void {
  for (const def of UNITS) {
    const owned = Object.values(s.units)
      .filter((u) => u.defId === def.id)
      .reduce((n, u) => n + u.copies, 0);
    const displayed = Object.values(s.players).reduce(
      (n, p) => n + p.shop.filter((id) => id === def.id).length,
      0,
    );
    if (s.pool[def.id] < 0 || s.pool[def.id] + owned + displayed !== def.poolCount)
      throw new Error(`Pool violation ${def.id}`);
  }
  for (const p of Object.values(s.players)) {
    if (
      p.gold < 0 ||
      p.level > 8 ||
      playerUnits(s, p.id).filter((u) => u.position.zone === 'board').length > p.level
    )
      throw new Error(`Player invariant ${p.id}`);
  }
  const occupied = new Set<string>();
  for (const u of Object.values(s.units)) {
    if (
      !validPosition(u.position) ||
      u.copies !== 3 ** (u.star - 1) ||
      u.items.length > 3 ||
      !s.players[u.ownerId] ||
      s.players[u.ownerId].teamId !== u.teamId
    )
      throw new Error(`Unit invariant ${u.id}`);
    const key = `${u.teamId}:${u.position.zone === 'bench' ? u.ownerId : ''}:${JSON.stringify(u.position)}`;
    if (occupied.has(key)) throw new Error(`Overlapping ${key}`);
    occupied.add(key);
  }
}
