import type { Command, GameState, UnitInstance } from '../../domain/types';
import { ITEM_BY_ID, RULES, SYNERGIES, UNIT_BY_ID, saleValue } from '../../content';
import { icon, itemIcon, tagIcon } from './icons';
import type { GameResources } from '../resources';
import type { SafeArea } from '../scene';
import type { CombatStatRow } from '../combat-stats';
export type HudAction =
  | Command['type']
  | 'start'
  | 'retry'
  | 'home'
  | 'view'
  | 'cancel'
  | 'swap-mode'
  | 'seat'
  | 'item'
  | 'confirm-sell'
  | 'cancel-sell';
export class GameHud {
  readonly board: HTMLElement;
  private state: GameState | null = null;
  private actor = '';
  private view = 'team-0';
  private selected: UnitInstance | undefined;
  private shopOpen = true;
  private dragging = false;
  private shopButtons: HTMLButtonElement[] = [];
  private teamButtons = new Map<string, HTMLButtonElement>();
  private itemButtons: HTMLButtonElement[] = [];
  private synergyButtons: HTMLButtonElement[] = [];
  private phase = '';
  private toastTimer: ReturnType<typeof setTimeout> | undefined;
  private bannerTimer: ReturnType<typeof setTimeout> | undefined;
  private observer: ResizeObserver;
  private previousGold: number | null = null;
  private noticePoint: { x: number; y: number; at: number } | null = null;
  private offs: (() => void)[] = [];
  onLayout: (area: SafeArea) => void = () => {};
  constructor(
    readonly root: HTMLElement,
    private art: GameResources,
    private action: (name: HudAction, value?: string | number) => void,
  ) {
    root.innerHTML = `<div id="board" aria-label="自动战斗棋盘"></div>
  <div class="game-vignette"></div>
  <div class="hud-top" data-ui><div class="team-crest ally">${icon('shield')}<div class="crest-copy"><small id="ally-context">我方战队</small><span id="ally-name">共生小队</span></div><strong id="ally-hp">100</strong><div class="team-hp"><i id="ally-bar"></i></div></div><div class="round-medallion"><small id="round">集结</small><strong id="clock">—</strong><span id="phase">等待机师</span></div><div class="team-crest enemy">${icon('beast')}<div class="crest-copy"><small>本轮对手</small><span id="enemy-name">未知对手</span></div><strong id="enemy-hp">—</strong><div class="team-hp"><i id="enemy-bar"></i></div></div></div>
  <div id="shop-odds" class="shop-odds" data-ui aria-label="商店等级概率"><strong id="odds-level">Lv.1</strong><span data-tier="1"></span><span data-tier="2"></span><span data-tier="3"></span><span data-tier="4"></span><span data-tier="5"></span></div>
  <div class="corner-controls" data-ui><button id="menu-toggle" class="round-button" aria-label="设置与玩法">${icon('gear')}</button><button id="home" class="round-button" aria-label="返回本队" hidden>${icon('back')}</button></div>
  <div class="formation-hud" data-ui><div class="side-heading"><span>阵容羁绊</span><b id="population">0 / 0</b></div><button id="synergy-toggle" class="round-button" aria-label="羁绊">${icon('magic')}</button><div id="synergies"></div></div>
  <div class="battle-stats" data-ui aria-live="polite"><div class="side-heading"><span>造成伤害</span><small>实时</small></div><div id="damage-rows"><p>同步战斗数据</p></div></div>
  <div class="ranking-hud" data-ui><div class="side-heading"><span>战队排名</span><small>生命</small></div><button id="ranking-toggle" class="round-button" aria-label="队伍排名">${icon('flag')}</button><div id="teams"></div></div>
  <div class="item-hud" data-ui><button id="bag-toggle" class="round-button" aria-label="装备背包">${icon('bag')}<small id="bag-count">0</small></button><div id="items" class="item-tray" hidden></div><p id="item-description" hidden></p></div>
  <div id="detail" class="unit-detail" data-ui hidden><button id="detail-close" class="close-button" aria-label="关闭棋子详情">${icon('close')}</button><img id="detail-portrait" alt=""><div class="detail-heading"><h2 id="detail-name"></h2><span id="detail-stars"></span><small id="detail-owner"></small></div><p id="detail-tags"></p><div id="detail-stats"></div><p id="detail-skill"></p><div id="detail-items"><span class="equipped-slot"><i></i><small></small></span><span class="equipped-slot"><i></i><small></small></span><span class="equipped-slot"><i></i><small></small></span></div><div class="unit-actions"><button id="swap-mode">${icon('swap')}换位</button><button id="demand">${icon('flag')}需要</button><button id="sell">${icon('coin')}<span id="sell-value"></span></button></div></div>
  <div id="synergy-detail" class="synergy-detail" data-ui hidden></div>
  <div id="shop" class="recruit-shop" data-ui><div class="shop-main"><div class="shop-heading"><span>棋子招募</span><small id="shop-hint">与你的队友共同进化</small></div><div id="shop-cards"></div></div><div class="shop-actions"><button id="shop-close" class="round-button" aria-label="收起商店">${icon('close')}</button><button id="refresh" class="shop-action-primary" aria-label="刷新商店">${icon('refresh')}<span>刷新</span><small>${RULES.refreshCost}</small><kbd>D</kbd></button><button id="lock" class="round-button" aria-label="锁定商店">${icon('lock')}<small>锁</small></button></div></div>
  <div class="bottom-hud" data-ui><div class="player-economy"><span id="player-name">机师</span><strong id="gold">${icon('coin')}<b>0</b></strong><small id="interest">利息 +0</small></div><button id="xp" class="xp-button" aria-label="购买经验"><span id="level">Lv.1</span><i><b id="xp-fill"></b></i><small id="xp-label"></small><em>${icon('xp')}<span>${RULES.xpCost}</span></em></button><div class="field-controls"><button id="shop-toggle" class="shop-toggle-button">${icon('shop')}<span>商店</span><kbd>Space</kbd></button><button id="ready" class="ready-button">${icon('check')}<span>准备完成</span></button></div></div>
  <div id="sell-zone" data-ui hidden>${icon('sell')}<span>拖到此处出售</span><strong></strong></div><div id="drop-hint" role="status" hidden></div><div id="drag-item" hidden></div>
  <div id="sell-confirm" class="sell-confirm" data-ui role="dialog" aria-modal="true" aria-labelledby="sell-confirm-title" hidden><div class="sell-confirm-card"><span class="sell-confirm-icon">${icon('sell')}</span><small>出售棋子</small><h2 id="sell-confirm-title"></h2><p id="sell-confirm-stars"></p><strong id="sell-confirm-value"></strong><div><button id="sell-confirm-cancel">取消</button><button id="sell-confirm-submit">确认出售</button></div></div></div>
  <div id="stage-banner" aria-live="polite" hidden><small></small><strong></strong></div><div id="toast" role="status" aria-live="polite"></div>
  <div id="lobby" class="lobby-overlay" data-ui><div class="lobby-emblem">${icon('shield')}</div><small>双人协作 · 八队竞技</small><h1>共生战线</h1><p id="lobby-message">等待机师加入战场</p><button id="start" class="ready-button">开始远征</button></div>
  <div id="menu" class="game-menu" data-ui hidden><button id="menu-close" class="close-button" aria-label="关闭">${icon('close')}</button><h2>战场指南</h2><p>买棋后拖到己方半场部署。拖到已占格可合法换位，中央金色四格用于交付队友。</p><p>装备可拖给自己的棋子；拖动棋子到出售区域可出售。每人独立经济，共享生命与羁绊。</p><p>手机支持点选再点空格。先点“换位”再点目标棋子，也能完成交换。</p><p class="keys">D 刷新 · F 经验 · Space 商店 · Esc 取消</p><button id="debug-toggle" hidden>开发工具</button><div id="debug" hidden><button id="local-seat">切换本地席位</button><pre id="debug-log"></pre></div></div>`;
    this.board = this.el('board');
    const click = (id: string, fn: () => void) => {
      this.el(id).onclick = fn;
    };
    for (const name of ['xp', 'refresh', 'lock', 'ready', 'sell', 'demand', 'swap-mode'] as const)
      click(name, () => this.action(name));
    click('start', () => this.action(this.state?.phase === 'error' ? 'retry' : 'start'));
    click('home', () => this.action('home'));
    click('detail-close', () => this.action('cancel'));
    click('sell-confirm-cancel', () => this.action('cancel-sell'));
    click('sell-confirm-submit', () => this.action('confirm-sell'));
    this.el('sell-confirm').onclick = (event) => {
      if (event.target === this.el('sell-confirm')) this.action('cancel-sell');
    };
    click('local-seat', () => this.action('seat'));
    click('shop-toggle', () => this.toggleShop());
    click('shop-close', () => this.toggleShop(false));
    click('menu-toggle', () => (this.el('menu').hidden = !this.el('menu').hidden));
    click('menu-close', () => (this.el('menu').hidden = true));
    click('ranking-toggle', () => root.classList.toggle('rankings-open'));
    click('synergy-toggle', () => root.classList.toggle('synergies-open'));
    click('bag-toggle', () => (this.el('items').hidden = !this.el('items').hidden));
    click('debug-toggle', () => (this.el('debug').hidden = !this.el('debug').hidden));
    SYNERGIES.forEach((def) => {
      const b = document.createElement('button');
      b.className = 'synergy-chip';
      b.innerHTML = `${icon(tagIcon[def.id])}<span>${def.name}</span><b>0</b>`;
      b.title = def.name;
      b.onclick = () => {
        const box = this.el('synergy-detail');
        if (!box.hidden && box.dataset.id === def.id) {
          box.hidden = true;
          return;
        }
        box.dataset.id = def.id;
        box.textContent = `${def.name} · ${def.thresholds.join('/')}\n${def.description}`;
        box.hidden = false;
      };
      this.el('synergies').append(b);
      this.synergyButtons.push(b);
    });
    for (let slot = 0; slot < 5; slot++) {
      const b = document.createElement('button');
      b.className = 'recruit-card';
      b.innerHTML =
        '<img alt=""><div class="card-light"></div><span class="card-cost"></span><span class="card-rarity">★</span><span class="card-title"></span><span class="card-tags"></span><span class="card-demand">队友需要</span>';
      b.onclick = () => {
        const r = b.getBoundingClientRect();
        this.markInteraction(r.left + r.width / 2, r.top);
        this.action('buy', slot);
      };
      this.el('shop-cards').append(b);
      this.shopButtons.push(b);
    }
    this.observer = new ResizeObserver(() => this.layout());
    this.observer.observe(root);
    this.observer.observe(this.el('shop'));
    this.observer.observe(root.querySelector('.bottom-hud')!);
  }
  el<T extends HTMLElement = HTMLElement>(id: string): T {
    return this.root.querySelector(`#${id}`) as T;
  }
  setDevelopment(local: boolean): void {
    this.el('debug-toggle').hidden = !(local || import.meta.env.DEV);
    this.el('local-seat').hidden = !local;
  }
  toggleShop(value?: boolean): void {
    this.shopOpen = value ?? !this.shopOpen;
    this.updateShopVisibility();
  }
  private updateShopVisibility(): void {
    this.el('shop').hidden = this.state?.phase !== 'prep' || !this.shopOpen || this.dragging;
    this.root.classList.toggle('shop-open', !this.el('shop').hidden);
    this.el('shop-toggle').setAttribute('aria-pressed', String(this.shopOpen));
    this.layout();
  }
  layout(): void {
    const portrait = this.root.clientWidth < 620 && this.root.clientHeight > this.root.clientWidth;
    const compact = this.root.clientHeight < 550;
    const dock = this.root.querySelector('.bottom-hud')!.getBoundingClientRect();
    this.onLayout({
      top: Math.max(
        portrait ? 126 : compact ? 62 : 88,
        this.root.querySelector('.hud-top')!.getBoundingClientRect().bottom + 6,
      ),
      bottom: this.root.clientHeight - dock.top + 8,
      left: portrait ? 18 : compact ? 76 : 112,
      right: portrait ? 18 : compact ? 132 : 150,
    });
  }
  setDragging(value: boolean, sellPrice?: number): void {
    this.dragging = value;
    this.root.classList.toggle('dragging', value);
    this.root.classList.toggle('sell-dragging', value && sellPrice !== undefined);
    this.el('sell-zone').hidden = !value || sellPrice === undefined;
    this.el('sell-zone').querySelector('strong')!.textContent =
      sellPrice === undefined ? '' : `${sellPrice} 金`;
    this.updateShopVisibility();
    if (!value) {
      this.el('drop-hint').hidden = true;
      this.el('drag-item').hidden = true;
    }
  }
  sellHit(x: number, y: number): boolean {
    const e = this.el('sell-zone');
    if (e.hidden) return false;
    const r = e.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }
  hint(text: string, valid: boolean, x: number, y: number): void {
    const el = this.el('drop-hint');
    el.hidden = !text;
    el.textContent = text;
    el.classList.toggle('invalid', !valid);
    el.style.left = `${Math.max(90, Math.min(this.root.clientWidth - 90, x))}px`;
    el.style.top = `${Math.max(110, y - 48)}px`;
  }
  itemGhost(id: string, x: number, y: number): void {
    const el = this.el('drag-item');
    el.hidden = false;
    if (el.dataset.id !== id) {
      el.dataset.id = id;
      el.innerHTML = icon(itemIcon[id]);
    }
    el.style.transform = `translate(${x - 24}px,${y - 36}px)`;
  }
  setBusy(busy: boolean): void {
    this.root.classList.toggle('command-pending', busy);
    this.el('detail').setAttribute('aria-busy', String(busy));
  }
  markInteraction(x: number, y: number): void {
    this.noticePoint = { x, y, at: performance.now() };
  }
  showNotice(text: string): void {
    const point = this.noticePoint;
    const toast = this.el('toast');
    if (point && performance.now() - point.at < 4000) {
      toast.style.left = `${Math.max(120, Math.min(this.root.clientWidth - 120, point.x))}px`;
      toast.style.top = `${Math.max(80, Math.min(this.root.clientHeight - 120, point.y - 65))}px`;
      toast.style.maxWidth = '230px';
    } else {
      toast.style.left = '';
      toast.style.top = '';
      toast.style.maxWidth = '';
    }

    this.el('toast').textContent = text;
    this.el('toast').classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.el('toast').classList.remove('show'), 2700);
  }
  showPhase(title: string, subtitle = ''): void {
    const b = this.el('stage-banner');
    b.hidden = false;
    b.querySelector('strong')!.textContent = title;
    b.querySelector('small')!.textContent = subtitle;
    b.getAnimations().forEach((a) => a.cancel());
    b.animate(
      [
        { opacity: 0, transform: 'translate(-50%,-40%) scale(.92)' },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' },
      ],
      { duration: 220, fill: 'both' },
    );
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => (b.hidden = true), 1800);
  }
  feedback(command: Command): void {
    if (command.type === 'buy' && command.slot !== undefined)
      this.shopButtons[command.slot].animate(
        [
          { filter: 'brightness(2)', transform: 'translateY(-9px)' },
          { filter: 'brightness(1)', transform: 'translateY(0)' },
        ],
        { duration: 260 },
      );
  }
  update(
    s: GameState,
    actor: string,
    view: string,
    selectedId: string | null,
    itemSlot: number | null = null,
  ): void {
    const viewChanged = this.view !== view;
    this.state = s;
    this.actor = actor;
    this.view = view;
    this.selected = s.units[selectedId ?? ''];
    this.root.dataset.phase = s.phase;
    this.root.classList.toggle('viewing-away', view !== s.players[actor]?.teamId);
    const p = s.players[actor],
      team = s.teams[view],
      can = s.phase === 'prep' && !!p && (s.teams[p.teamId]?.hp ?? 0) > 0;
    if (this.phase !== s.phase) {
      this.phase = s.phase;
      if (s.phase === 'prep') {
        this.shopOpen = true;
        this.showPhase('部署阵容', `第 ${s.round} 回合`);
      }
      if (s.phase === 'battle') {
        this.closeTransient();
        this.shopOpen = false;
        this.el('items').hidden = true;
        this.setCombatStats([], true);
        this.showPhase('战斗开始', `第 ${s.round} 回合`);
      }
      if (s.phase === 'settlement') {
        const battle = s.battles.find(
          (b) => b.teams[0] === view || (b.teams[1] === view && !b.mirror),
        );
        const r = battle ? s.results[battle.id] : undefined;
        this.showPhase(
          r?.winner === null ? '平局' : r && battle?.teams[r.winner!] === view ? '胜利' : '战败',
          s.lastSummary.find((t) => t.startsWith(team?.name ?? '')) ?? '战斗已结束',
        );
      }
      this.updateShopVisibility();
    }
    if (viewChanged && s.phase === 'battle') this.setCombatStats([], true);
    const battle = s.battles.find((b) => b.teams[0] === view || (b.teams[1] === view && !b.mirror)),
      opponent = battle ? battle.teams[battle.teams[0] === view ? 1 : 0] : null,
      enemy = opponent ? s.teams[opponent] : undefined;
    this.el('ally-name').textContent = team?.name ?? '共生小队';
    this.el('ally-context').textContent = view === p?.teamId ? '我方战队' : '观战战队';
    this.el('ally-hp').textContent = String(team?.hp ?? 100);
    this.el('ally-bar').style.width = `${team?.hp ?? 100}%`;
    this.el('enemy-name').textContent = battle?.neutral ? '野外守卫' : (enemy?.name ?? '等待对阵');
    this.el('enemy-hp').textContent = enemy ? String(enemy.hp) : '—';
    this.el('enemy-bar').style.width = `${enemy?.hp ?? 100}%`;
    this.el('round').textContent = s.round ? `第 ${s.round} 回合` : '双人集结';
    this.el('phase').textContent = {
      waiting: '等待机师',
      prep: '准备阶段',
      battle: s.deadline ? '自动战斗' : '双方入场',
      settlement: '战斗结算',
      finished: '远征结束',
      error: '战线暂停',
    }[s.phase];
    this.el('player-name').textContent = p ? `${p.name} · ${p.seat ? 'B' : 'A'}` : '机师';
    this.el('gold').querySelector('b')!.textContent = String(p?.gold ?? 0);
    if (p && this.previousGold !== null && this.previousGold !== p.gold)
      this.el('gold').animate(
        [
          { color: p.gold > this.previousGold ? '#b8ffd5' : '#ffdb89', transform: 'scale(1.15)' },
          { color: '#f1d297', transform: 'scale(1)' },
        ],
        { duration: 300 },
      );
    this.previousGold = p?.gold ?? null;
    this.el('interest').textContent =
      `利息 +${Math.min(RULES.interestCap, Math.floor((p?.gold ?? 0) / RULES.interestStep))}`;
    const level = p?.level ?? 1,
      base = RULES.experience[level - 1],
      next = RULES.experience[level];
    this.el('level').textContent = `Lv.${level}`;
    this.el('xp-label').textContent = next
      ? `${(p?.exp ?? 0) - base}/${next - base} 经验`
      : '最高等级';
    this.el('xp-fill').style.width = next
      ? `${(((p?.exp ?? 0) - base) / (next - base)) * 100}%`
      : '100%';
    this.el('odds-level').textContent = `Lv.${level}`;
    const odds = RULES.shopOdds[level - 1] ?? RULES.shopOdds[0];
    this.el('shop-odds')
      .querySelectorAll<HTMLElement>('[data-tier]')
      .forEach((node, i) => (node.textContent = `★${i + 1} ${odds[i]}%`));
    this.el<HTMLButtonElement>('xp').disabled =
      !can || (p?.gold ?? 0) < RULES.xpCost || level === RULES.maxLevel;
    this.el<HTMLButtonElement>('refresh').disabled = !can || (p?.gold ?? 0) < RULES.refreshCost;
    this.el<HTMLButtonElement>('lock').disabled = !can;
    this.el<HTMLButtonElement>('shop-toggle').disabled = !can;
    this.el('lock').classList.toggle('active', p?.shopLocked ?? false);
    this.el('lock').setAttribute('aria-pressed', String(p?.shopLocked ?? false));
    this.el<HTMLButtonElement>('ready').disabled = !can;
    this.el('ready').querySelector('span')!.textContent = p?.ready ? '已就绪' : '准备完成';
    this.el('ready').classList.toggle('active', p?.ready ?? false);
    const units = Object.values(s.units).filter(
      (u) => u.teamId === view && u.position.zone === 'board',
    );
    const counts: Record<string, number> = {};
    for (const id of new Set(units.map((u) => u.defId)))
      for (const tag of UNIT_BY_ID[id].tags) counts[tag] = (counts[tag] ?? 0) + 1;
    SYNERGIES.forEach((def, i) => {
      const count = counts[def.id] ?? 0,
        b = this.synergyButtons[i];
      b.classList.toggle('active', count >= def.thresholds[0]);
      b.querySelector('b')!.textContent =
        `${count}/${def.thresholds.find((n) => n > count) ?? def.thresholds.at(-1)}`;
    });
    this.el('population').textContent =
      `${units.length} / ${team?.players.reduce((n, id) => n + s.players[id].level, 0) ?? 0}`;
    const mate = p
      ? s.players[s.teams[p.teamId].players.find((id) => id !== actor) ?? '']
      : undefined;
    this.shopButtons.forEach((b, i) => {
      const id = p?.shop[i],
        def = id ? UNIT_BY_ID[id] : null;
      b.disabled = !can || !def || (p?.gold ?? 0) < def.cost;
      b.classList.toggle('empty', !def);
      b.style.setProperty(
        '--rarity',
        def ? ['#b7c4b3', '#7ab99a', '#719aca', '#aa85c5', '#d2af60'][def.cost - 1] : '#465047',
      );
      const img = b.querySelector('img')!;
      if (def && img.dataset.id !== def.id) {
        img.dataset.id = def.id;
        img.src = this.art.portrait(def.id);
        img.alt = def.name;
      }
      img.hidden = !def;
      b.querySelector('.card-title')!.textContent = def?.name ?? '已招募';
      b.querySelector('.card-cost')!.textContent = def ? String(def.cost) : '';
      b.querySelector('.card-tags')!.textContent = def
        ? def.tags.map((t) => SYNERGIES.find((d) => d.id === t)!.name).join(' · ')
        : '';
      (b.querySelector('.card-demand') as HTMLElement).hidden = !def || mate?.demand !== def.id;
    });
    this.el('bag-count').textContent = String(p?.items.length ?? 0);
    while (this.itemButtons.length < (p?.items.length ?? 0)) {
      const b = document.createElement('button');
      b.className = 'item-icon';
      b.dataset.item = String(this.itemButtons.length);
      b.innerHTML = '<span></span><small></small>';
      this.el('items').append(b);
      this.itemButtons.push(b);
    }
    this.itemButtons.forEach((b, i) => {
      const id = p?.items[i];
      b.hidden = !id;
      b.disabled = !can;
      if (id) {
        if (b.dataset.art !== id) {
          b.dataset.art = id;
          b.querySelector('span')!.innerHTML = icon(itemIcon[id]);
        }
        b.querySelector('small')!.textContent = ITEM_BY_ID[id].name;
        b.title = ITEM_BY_ID[id].description;
        b.classList.toggle('selected', itemSlot === i);
      }
    });
    const selectedEquipment = itemSlot === null ? undefined : p?.items[itemSlot];
    this.el('item-description').hidden = !selectedEquipment || this.dragging;
    this.el('item-description').textContent = selectedEquipment
      ? `${ITEM_BY_ID[selectedEquipment].name} · ${ITEM_BY_ID[selectedEquipment].description}`
      : '';
    this.el('home').hidden = view === 'team-0';
    Object.values(s.teams)
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99) || b.hp - a.hp)
      .forEach((t, i) => {
        let b = this.teamButtons.get(t.id);
        if (!b) {
          b = document.createElement('button');
          b.className = 'team-chip';
          b.innerHTML = `<small class="team-rank"></small><span class="avatar">${icon(t.id === 'team-0' ? 'shield' : 'beast')}</span><span class="team-caption"></span><strong></strong><i class="team-chip-bar"><b></b></i>`;
          b.onclick = () => {
            this.root.classList.remove('rankings-open');
            this.action('view', t.id);
          };
          this.el('teams').append(b);
          this.teamButtons.set(t.id, b);
        }
        b.style.order = String(i);
        b.querySelector('.team-rank')!.textContent = String(t.rank ?? i + 1);
        b.querySelector('.team-caption')!.textContent = t.name;
        b.title = `${t.name} · ${t.players
          .map((id) => s.players[id]?.name)
          .filter(Boolean)
          .join(' / ')}`;
        b.querySelector('strong')!.textContent = String(t.hp);
        b.querySelector('.team-chip-bar b')!.setAttribute('style', `width:${t.hp}%`);
        b.classList.toggle('selected', t.id === view);
        b.classList.toggle('eliminated', t.hp <= 0);
      });
    this.updateDetail(can);
    const lobby = this.el('lobby');
    lobby.hidden = !['waiting', 'finished', 'error'].includes(s.phase);
    lobby.querySelector('h1')!.textContent =
      s.phase === 'finished'
        ? `第 ${s.teams['team-0']?.rank ?? '—'} 名`
        : s.phase === 'error'
          ? '战线暂停'
          : '共生战线';
    this.el('lobby-message').textContent =
      s.phase === 'error'
        ? (s.error ?? '等待房主恢复')
        : s.phase === 'finished'
          ? `远征完成 · ${s.round} 回合`
          : `${Object.values(s.players).filter((p) => !p.bot).length}/2 位机师已加入 · 由房主开始`;
    this.el('start').hidden = s.phase === 'finished';
    this.el('start').textContent = s.phase === 'error' ? '重试恢复' : '开始远征';
    this.el<HTMLButtonElement>('start').disabled =
      s.phase === 'waiting' && Object.keys(s.players).length < 2;
    this.el('debug-log').textContent =
      team?.players.flatMap((id) => s.players[id].botMemory.log).join('\n') ?? '';
  }
  private updateDetail(can: boolean): void {
    const u = this.selected;
    this.el('detail').hidden = !u || this.dragging;
    this.root.classList.toggle('unit-selected', !!u && !this.dragging);
    if (!u) return;
    const d = UNIT_BY_ID[u.defId];
    const img = this.el<HTMLImageElement>('detail-portrait');
    if (img.dataset.id !== d.id) {
      img.dataset.id = d.id;
      img.src = this.art.portrait(d.id);
      img.alt = d.name;
    }
    this.el('detail-name').textContent = d.name;
    this.el('detail-stars').textContent = '★'.repeat(u.star);
    this.el('detail-owner').textContent = this.state?.players[u.ownerId]?.name ?? '';
    this.el('detail-tags').textContent = d.tags
      .map((t) => SYNERGIES.find((x) => x.id === t)!.name)
      .join(' · ');
    this.el('detail-stats').textContent =
      `生命 ${Math.floor((d.hp * RULES.starScale[u.star - 1]) / 100)}  /  攻击 ${Math.floor((d.attack * RULES.starScale[u.star - 1]) / 100)}  /  射程 ${d.range}`;
    this.el('detail-skill').textContent = `${d.skill.name}：${d.skill.description}`;
    this.el('detail-items')
      .querySelectorAll<HTMLElement>('.equipped-slot')
      .forEach((slot, i) => {
        const id = u.items[i];
        if (slot.dataset.item !== (id ?? '')) {
          slot.dataset.item = id ?? '';
          slot.querySelector('i')!.innerHTML = id ? icon(itemIcon[id]) : icon('bag');
        }
        slot.querySelector('small')!.textContent = id ? ITEM_BY_ID[id].name : '空槽';
        slot.title = id ? ITEM_BY_ID[id].description : '从背包选择装备';
      });
    this.el<HTMLButtonElement>('sell').disabled =
      !can || u.ownerId !== this.actor || u.position.zone === 'public';
    this.el('sell-value').textContent = String(this.salePrice(u));
    this.el<HTMLButtonElement>('swap-mode').disabled = !can || u.position.zone === 'public';
    this.el<HTMLButtonElement>('demand').disabled = !can;
  }
  salePrice(u: UnitInstance): number {
    return saleValue(u);
  }
  showSellConfirm(u: UnitInstance): void {
    const def = UNIT_BY_ID[u.defId],
      dialog = this.el('sell-confirm');
    this.el('sell-confirm-title').textContent = def.name;
    this.el('sell-confirm-stars').textContent = '★'.repeat(u.star);
    this.el('sell-confirm-value').textContent = `出售可获得 ${this.salePrice(u)} 金`;
    dialog.hidden = false;
    this.root.classList.add('sell-confirming');
    this.el<HTMLButtonElement>('sell-confirm-submit').focus();
  }
  hideSellConfirm(): void {
    this.el('sell-confirm').hidden = true;
    this.root.classList.remove('sell-confirming');
  }
  setCombatStats(rows: CombatStatRow[], syncing = false): void {
    const box = this.el('damage-rows');
    if (syncing) {
      box.innerHTML = '<p>同步战斗数据</p>';
      return;
    }
    if (!rows.length) {
      box.innerHTML = '<p>尚未造成伤害</p>';
      return;
    }
    const maximum = Math.max(1, ...rows.map((row) => row.damage));
    box.replaceChildren(
      ...rows.map((row) => {
        const def = UNIT_BY_ID[row.defId];
        const node = document.createElement('div');
        node.className = 'damage-row';
        const portrait = document.createElement('img');
        portrait.src = this.art.portrait(row.defId);
        portrait.alt = '';
        const copy = document.createElement('span');
        const name = document.createElement('small');
        name.textContent = def?.name ?? row.defId;
        const stars = document.createElement('i');
        stars.textContent = '★'.repeat(row.star);
        const bar = document.createElement('b');
        bar.style.width = `${(row.damage / maximum) * 100}%`;
        copy.append(name, stars, bar);
        const value = document.createElement('strong');
        value.textContent = String(row.damage);
        node.append(portrait, copy, value);
        return node;
      }),
    );
  }
  clock(ms: number, active: boolean): void {
    this.el('clock').textContent = active
      ? String(Math.max(0, Math.ceil(ms / 1000))).padStart(2, '0')
      : '—';
    this.el('clock').classList.toggle('urgent', active && ms < 5000);
  }
  closeTransient(): void {
    for (const id of [
      'detail',
      'menu',
      'synergy-detail',
      'items',
      'item-description',
      'sell-confirm',
    ])
      this.el(id).hidden = true;
    this.root.classList.remove('rankings-open', 'synergies-open', 'sell-confirming');
  }
  dispose(): void {
    clearTimeout(this.toastTimer);
    clearTimeout(this.bannerTimer);
    this.observer.disconnect();
    for (const off of this.offs) off();
  }
}
