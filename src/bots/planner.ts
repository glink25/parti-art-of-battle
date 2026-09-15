import type { Command, GameState, PlayerState, Tag, UnitInstance } from '../domain/types';
import { deriveSeed } from '../domain/random';
import { RULES, UNIT_BY_ID } from '../content';
import { applyCommand, firstBench, playerUnits, teamUnits } from '../rules/game';
export const TEMPLATES = [
  ['步兵交叉火力', 'infantry', 'guard', 'sniper'],
  ['骑兵爆破', 'cavalry', 'blast', 'sniper'],
  ['装甲炮阵', 'armor', 'guard', 'siege'],
  ['空军突袭', 'airforce', 'blast', 'assassin'],
  ['傀儡军团', 'puppet', 'vanguard', 'summoner'],
  ['灵能共振', 'psionic', 'blast', 'support'],
  ['陆行真伤', 'walker', 'guard', 'sniper'],
  ['海神攻城', 'marine', 'guard', 'siege'],
  ['野兽共生', 'beast', 'guard', 'vanguard'],
  ['猛禽制地', 'raptor', 'sniper', 'ability'],
  ['异虫速升', 'insectoid', 'blast', 'ability'],
  ['不朽控制', 'immortal', 'ability', 'vanguard'],
  ['熊猫开大', 'panda', 'ability', 'assassin'],
  ['护卫壁垒', 'guard', 'support', 'sniper'],
  ['爆破洪流', 'blast', 'armor', 'ability'],
  ['支援续航', 'support', 'beast', 'guard'],
  ['狙击穿甲', 'sniper', 'infantry', 'cavalry'],
  ['攻城重炮', 'siege', 'armor', 'marine'],
  ['异能压制', 'ability', 'psionic', 'blast'],
  ['刺杀切后', 'assassin', 'airforce', 'beast'],
  ['召唤浪潮', 'summoner', 'puppet', 'beast'],
  ['先锋再生', 'vanguard', 'beast', 'puppet'],
  ['建筑工事', 'building', 'support', 'sniper'],
  ['格斗极限', 'fighter', 'assassin', 'ability'],
].map(([name, race, ...jobs]) => ({ name, race: race as Tag, jobs: jobs as Tag[] }));
function strength(u: UnitInstance): number {
  return UNIT_BY_ID[u.defId].cost + u.star * 5;
}
function position(
  s: GameState,
  p: PlayerState,
  u: UnitInstance,
): { zone: 'board'; x: number; y: number } | null {
  const def = UNIT_BY_ID[u.defId],
    front = def.range <= 1 || def.tags.includes('guard');
  const occupied = teamUnits(s, p.teamId)
    .filter((u) => u.position.zone === 'board')
    .map((u) => (u.position.zone === 'board' ? `${u.position.x},${u.position.y}` : ''));
  const enemy = s.teams[p.teamId].lastOpponent;
  const threats = enemy ? teamUnits(s, enemy).filter((u) => u.position.zone === 'board') : [];
  const scatter = threats.filter((u) => UNIT_BY_ID[u.defId].tags.includes('blast')).length >= 2;
  const xs = p.seat === 0 ? [1, 3, 0, 2, 4] : [8, 6, 9, 7, 5];
  const ys = front ? [5, 6, 7, 8, 9] : scatter ? [8, 6, 9, 7, 5] : [8, 9, 7, 6, 5];
  for (const y of ys)
    for (const x of xs) if (!occupied.includes(`${x},${y}`)) return { zone: 'board', x, y };
  return null;
}
export function planBotActions(
  s: GameState,
  p: PlayerState,
): { command: Command; reason: string } | null {
  if (
    s.phase !== 'prep' ||
    s.teams[p.teamId].hp <= 0 ||
    p.botMemory.commands >= RULES.botCommandBudget
  )
    return null;
  const memory = p.botMemory,
    template = TEMPLATES[memory.template],
    owned = playerUnits(s, p.id),
    board = owned.filter((u) => u.position.zone === 'board');
  const wrap = (type: Command['type'], data: Partial<Command>, reason: string) => ({
    command: {
      commandId: `bot:${s.round}:${p.id}:${memory.serial}`,
      round: s.round,
      type,
      ...data,
    },
    reason,
  });
  const move = (u: UnitInstance, pos: Command['position'], reason: string) =>
    wrap('move', { unitId: u.id, unitVersion: u.version, position: pos }, reason);
  const waiting = owned
    .filter((u) => u.position.zone === 'bench')
    .sort((a, b) => strength(b) - strength(a));
  if (board.length < p.level && waiting.length) {
    const pos = position(s, p, waiting[0]);
    if (pos) return move(waiting[0], pos, '补足人口：部署最高战力');
  }
  if (waiting.length && board.length >= p.level) {
    const weakest = [...board].sort((a, b) => strength(a) - strength(b))[0];
    const slot = firstBench(s, p.id);
    if (weakest && slot >= 0 && strength(waiting[0]) > strength(weakest))
      return move(weakest, { zone: 'bench', slot }, '替换低战力棋子');
  }
  if (p.items.length && board.some((u) => u.items.length < 3)) {
    const target = [...board]
      .filter((u) => u.items.length < 3)
      .sort((a, b) => strength(b) - strength(a))[0];
    return wrap(
      'equip',
      { unitId: target.id, unitVersion: target.version, itemSlot: 0, itemId: p.items[0] },
      '将装备交给场上核心',
    );
  }
  const slot = firstBench(s, p.id);
  const publicUnits = teamUnits(s, p.teamId).filter(
    (u) => u.position.zone === 'public' && u.ownerId !== p.id,
  );
  const claim = publicUnits.find(
    (u) =>
      owned.some((v) => v.defId === u.defId) || UNIT_BY_ID[u.defId].tags.includes(template.race),
  );
  if (claim && slot >= 0) return move(claim, { zone: 'bench', slot }, '领取队友交付的阵容棋子');
  const mate = s.players[s.teams[p.teamId].players.find((id) => id !== p.id)!];
  const transfer = waiting.find(
    (u) => mate?.demand === u.defId && !owned.some((v) => v.id !== u.id && v.defId === u.defId),
  );
  const freePublic = [0, 1, 2, 3].find(
    (n) =>
      !teamUnits(s, p.teamId).some((u) => u.position.zone === 'public' && u.position.slot === n),
  );
  if (transfer && freePublic !== undefined)
    return move(transfer, { zone: 'public', slot: freePublic }, '响应队友对子需求');
  const pressure = s.teams[p.teamId].hp < 35,
    reserve = pressure ? 0 : s.round < 10 ? 5 : Math.min(50, (s.round - 5) * 3);
  if (
    p.level < 8 &&
    p.gold >= 5 &&
    p.gold - 5 >= reserve &&
    p.level < Math.min(8, 2 + Math.floor(s.round / 3))
  )
    return wrap('xp', {}, '按回合拉人口，保留经济底线');
  const choices = p.shop
    .flatMap((id, index) => {
      if (!id) return [];
      const def = UNIT_BY_ID[id];
      if (p.gold < def.cost) return [];
      const copies = owned.filter((u) => u.defId === id && u.position.zone !== 'public');
      const score =
        (def.tags.includes(template.race) ? 9 : 0) +
        (def.tags.includes(template.jobs[p.seat]) ? 4 : 0) +
        copies.length * 5 +
        (board.length < p.level ? 8 : 0) +
        def.cost +
        (mate?.demand === id ? 5 : 0);
      return [{ index, score, id }];
    })
    .sort((a, b) => b.score - a.score || a.index - b.index);
  if (
    choices.length &&
    (slot >= 0 ||
      owned.filter((u) => u.defId === choices[0].id && u.star === 1 && u.position.zone !== 'public')
        .length >= 2) &&
    choices[0].score >= 8
  )
    return wrap(
      'buy',
      { slot: choices[0].index, shopVersion: p.shopVersion },
      `购买 ${UNIT_BY_ID[choices[0].id].name}：阵容/对子评分 ${choices[0].score}`,
    );
  if (slot < 0) {
    const junk = waiting
      .filter((u) => !UNIT_BY_ID[u.defId].tags.includes(template.race))
      .sort((a, b) => strength(a) - strength(b))[0];
    if (junk)
      return wrap('sell', { unitId: junk.id, unitVersion: junk.version }, '清理偏离阵容的备战棋子');
  }
  if (slot >= 0 && p.gold >= reserve + 2 && memory.refreshes < RULES.botRefreshBudget)
    return wrap('refresh', {}, pressure ? '低生命搜牌保命' : '预算内刷新寻找阵容核心');
  return null;
}
export function advanceBots(s: GameState, includeHumans = false): boolean {
  const players = Object.values(s.players).filter(
    (p) => (p.bot || includeHumans) && s.teams[p.teamId].hp > 0,
  );
  if (!players.length) return false;
  for (let attempts = 0; attempts < players.length; attempts++) {
    const p = players[s.botCursor++ % players.length];
    const owned = playerUnits(s, p.id).filter((u) => u.position.zone !== 'public');
    const demand = owned.find(
      (u) => owned.filter((v) => v.defId === u.defId && v.star === u.star).length === 2,
    );
    p.demand = demand?.defId ?? null;
    const planned = planBotActions(s, p);
    if (!planned) continue;
    const id = p.id;
    const result = applyCommand(s, id, planned.command);
    const current = s.players[id];
    current.botMemory.commands++;
    current.botMemory.serial++;
    if (planned.command.type === 'refresh' && result.ok) current.botMemory.refreshes++;
    current.botMemory.log.push(
      `${s.round}: ${planned.reason}${result.ok ? '' : ` [${result.reason}]`}`,
    );
    current.botMemory.log = current.botMemory.log.slice(-6);
    return true;
  }
  return false;
}
export function resetBotRound(s: GameState): void {
  s.botCursor = deriveSeed(s.seed, `bot-order:${s.round}`) % 16;
  for (const p of Object.values(s.players)) {
    p.botMemory.commands = 0;
    p.botMemory.refreshes = 0;
  }
}
