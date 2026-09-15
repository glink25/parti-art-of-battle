import type { Command, CommandResult, GameState } from '../domain/types';
import { assessPlacement, samePosition } from '../domain/placement';
import { PLACEMENT_LIMITS, RULES } from '../content';
import type { BoardScene, Pick } from './scene';
import type { GameHud } from './hud/hud';
export type InputMode =
  'idle' | 'selected' | 'dragging' | 'equipment' | 'swapping' | 'confirming-sell' | 'pending';
interface InputHost {
  state(): GameState | null;
  actor(): string;
  view(): string;
  send(command: Omit<Command, 'commandId' | 'round'>): string | null;
  changed(): void;
}
interface PointerSession {
  id: number;
  x: number;
  y: number;
  unitId?: string;
  version?: number;
  item?: { slot: number; id: string };
  dragging: boolean;
  longPressed: boolean;
  touch: boolean;
  capture: HTMLElement;
}
export class InputController {
  selectedId: string | null = null;
  selectedItem: { slot: number; id: string } | null = null;
  mode: InputMode = 'idle';
  private pointer: PointerSession | null = null;
  private hold: ReturnType<typeof setTimeout> | undefined;
  private disposers: (() => void)[] = [];
  private selectedVersion: number | null = null;
  private pendingId: string | null = null;
  private sellCandidate: { id: string; version: number } | null = null;
  constructor(
    private root: HTMLElement,
    private scene: BoardScene,
    private hud: GameHud,
    private host: InputHost,
  ) {
    const on = (target: EventTarget, name: string, fn: (event: Event) => void) => {
      target.addEventListener(name, fn);
      this.disposers.push(() => target.removeEventListener(name, fn));
    };
    on(root, 'pointerdown', (event) => this.down(event as PointerEvent));
    on(root, 'pointermove', (event) => this.move(event as PointerEvent));
    on(root, 'pointerup', (event) => this.up(event as PointerEvent));
    on(root, 'pointercancel', () => this.cancel());
    on(root, 'lostpointercapture', () => {
      if (this.pointer) this.cancel();
    });
    on(root, 'contextmenu', (e) => {
      e.preventDefault();
      this.cancel();
    });
    on(window, 'blur', () => this.cancel());
    on(window, 'resize', () => this.cancel());
    on(document, 'visibilitychange', () => {
      if (document.hidden) this.cancel();
    });
    on(window, 'keydown', (e) => {
      const k = e as KeyboardEvent;
      if (
        k.repeat ||
        k.ctrlKey ||
        k.metaKey ||
        k.altKey ||
        (k.target as HTMLElement)?.closest('input,textarea,[contenteditable="true"]')
      )
        return;
      if (k.code === 'Escape') {
        k.preventDefault();
        this.cancel();
        this.hud.closeTransient();
        return;
      }
      if (this.mode === 'confirming-sell') return;
      if (!['KeyD', 'KeyF', 'Space'].includes(k.code)) return;
      k.preventDefault();
      if (k.code === 'Space' && !this.pointer) this.hud.toggleShop();
      else if (this.canOperate() && !this.pointer)
        this.host.send({ type: k.code === 'KeyD' ? 'refresh' : 'xp' });
    });
  }
  private canOperate(): boolean {
    const s = this.host.state(),
      p = s?.players[this.host.actor()];
    return (
      !!s &&
      s.phase === 'prep' &&
      this.host.view() === p?.teamId &&
      (s.teams[p.teamId]?.hp ?? 0) > 0
    );
  }
  private down(e: PointerEvent): void {
    if (
      e.button !== 0 ||
      this.pointer ||
      this.mode === 'pending' ||
      this.mode === 'confirming-sell'
    )
      return;
    this.hud.markInteraction(e.clientX, e.clientY);
    const target = e.target as HTMLElement;
    const itemButton = target.closest<HTMLButtonElement>('[data-item]');
    if (!itemButton && target.closest('[data-ui]')) return;
    const pick = itemButton
      ? null
      : this.scene.pick(e.clientX, e.clientY, undefined, e.pointerType === 'touch');
    const s = this.host.state();
    if (!s) return;
    if (itemButton?.disabled) return;
    const slot = itemButton ? Number(itemButton.dataset.item) : null;
    const item = slot !== null ? s.players[this.host.actor()]?.items[slot] : null;
    const capture = itemButton ?? this.scene.renderer.domElement;
    this.pointer = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      unitId: pick?.unitId,
      version: pick?.unitId ? s.units[pick.unitId]?.version : undefined,
      item: slot !== null && item ? { slot, id: item } : undefined,
      dragging: false,
      longPressed: false,
      touch: e.pointerType === 'touch',
      capture,
    };
    capture.setPointerCapture(e.pointerId);
    if (pick?.unitId && s.units[pick.unitId])
      this.hold = setTimeout(() => {
        if (!this.pointer) return;
        this.pointer.longPressed = true;
        this.select(pick.unitId!);
      }, 430);
  }
  private move(e: PointerEvent): void {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    this.hud.markInteraction(e.clientX, e.clientY);
    if (!p.dragging && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 7) {
      clearTimeout(this.hold);
      if (!this.canOperate() || (!p.unitId && !p.item) || p.longPressed) return;
      const s = this.host.state()!,
        u = s.units[p.unitId ?? ''];
      if (u && u.position.zone === 'bench' && u.ownerId !== this.host.actor()) {
        this.hud.showNotice('队友的备战棋子不能操作');
        this.cancel();
        return;
      }
      if (p.unitId && !u) return;
      p.dragging = true;
      this.mode = 'dragging';
      this.scene.lockCamera(true);
      if (p.unitId) {
        this.selectedId = p.unitId;
        this.selectedVersion = u.version;
      }
      if (p.item) this.selectedItem = p.item;
      this.hud.setDragging(
        true,
        u && u.ownerId === this.host.actor() && u.position.zone !== 'public'
          ? this.hud.salePrice(u)
          : undefined,
      );
      this.host.changed();
    }
    if (!p.dragging) return;
    const pick = this.scene.pick(e.clientX, e.clientY, p.unitId, p.touch);
    if (p.item) {
      this.hud.itemGhost(p.item.id, e.clientX, e.clientY);
      const reason = this.equipReason(pick?.unitId, p.item);
      this.scene.highlight(pick, !reason);
      this.hud.hint(reason || '松手装备', !reason, e.clientX, e.clientY);
      return;
    }
    this.scene.setPreview(p.unitId!, e.clientX, e.clientY);
    if (this.hud.sellHit(e.clientX, e.clientY)) {
      this.scene.highlight(null, false);
      this.hud.hint('松手进入出售确认', true, e.clientX, e.clientY);
      return;
    }
    const intent = this.placement(p.unitId!, p.version!, pick);
    this.scene.highlight(pick, intent.ok);
    this.hud.hint(
      intent.reason || (pick?.unitId ? '松手换位' : '松手放置'),
      intent.ok,
      e.clientX,
      e.clientY,
    );
  }
  private up(e: PointerEvent): void {
    const p = this.pointer;
    if (!p || p.id !== e.pointerId) return;
    this.hud.markInteraction(e.clientX, e.clientY);
    clearTimeout(this.hold);
    const pick = this.scene.pick(e.clientX, e.clientY, p.dragging ? p.unitId : undefined, p.touch),
      selling = p.dragging && !!p.unitId && this.hud.sellHit(e.clientX, e.clientY);
    this.finishPointer();
    if (p.longPressed && !p.dragging) return;
    if (p.dragging) {
      if (p.item) {
        this.equip(pick?.unitId, p.item);
        return;
      }
      if (selling) {
        this.requestSell(p.unitId!, p.version!);
        return;
      }
      const u = this.host.state()?.units[p.unitId ?? ''];
      if (
        u &&
        pick?.position &&
        samePosition(u.position, pick.position) &&
        (pick.position.zone !== 'bench' || pick.seat === this.host.state()!.players[u.ownerId].seat)
      ) {
        this.mode = 'selected';
        this.host.changed();
        return;
      }
      const decision = this.placement(p.unitId!, p.version!, pick);
      if (decision.ok && decision.command) this.submit(decision.command);
      else {
        this.mode = 'selected';
        this.hud.showNotice(decision.reason);
        this.host.changed();
      }
      return;
    }
    if (p.item) {
      this.selectedItem = p.item;
      this.mode = 'equipment';
      this.hud.showNotice('点击自己的棋子穿戴装备');
      this.host.changed();
      return;
    }
    if (this.selectedItem) {
      this.equip(pick?.unitId, this.selectedItem);
      return;
    }
    if (pick?.unitId) {
      if (this.mode === 'swapping' && this.selectedId) {
        const decision = this.placement(this.selectedId, this.selectedVersion!, pick);
        if (decision.ok && decision.command) this.submit(decision.command);
        else this.hud.showNotice(decision.reason);
      } else this.select(pick.unitId);
      return;
    }
    if (pick?.position && this.selectedId && this.canOperate()) {
      const u = this.host.state()!.units[this.selectedId];
      if (
        u &&
        samePosition(u.position, pick.position) &&
        (pick.position.zone !== 'bench' || pick.seat === this.host.state()!.players[u.ownerId].seat)
      ) {
        this.cancel();
        return;
      }
      const decision = this.placement(this.selectedId, this.selectedVersion!, pick);
      if (decision.ok && decision.command) this.submit(decision.command);
      else this.hud.showNotice(decision.reason);
    } else this.cancel();
  }
  private placement(
    id: string,
    version: number,
    pick: Pick | null,
  ): { ok: boolean; reason: string; command?: Omit<Command, 'commandId' | 'round'> } {
    const s = this.host.state();
    if (!s || !this.canOperate()) return { ok: false, reason: '当前不能布阵' };
    if (!pick) return { ok: false, reason: '放回棋盘或备战区' };
    const target = s.units[pick.unitId ?? ''];
    const benchOwnerId =
      pick.position?.zone === 'bench'
        ? Object.values(s.players).find(
            (p) => p.teamId === this.host.view() && p.seat === pick.seat,
          )?.id
        : undefined;
    const intent = {
      kind: target ? ('swap' as const) : ('move' as const),
      unitId: id,
      unitVersion: version,
      position: pick.position,
      benchOwnerId,
      targetId: target?.id,
      targetVersion: target?.version,
    };
    const decision = assessPlacement(s, this.host.actor(), intent, PLACEMENT_LIMITS);
    return {
      ...decision,
      command: {
        type: intent.kind,
        unitId: id,
        unitVersion: version,
        position: pick.position,
        benchOwnerId,
        targetId: target?.id,
        targetVersion: target?.version,
      },
    };
  }
  private equipReason(id: string | undefined, item: { slot: number; id: string }): string {
    const s = this.host.state(),
      u = s?.units[id ?? ''],
      p = s?.players[this.host.actor()];
    if (!this.canOperate()) return '当前不能装备';
    if (!u || u.ownerId !== p?.id || u.position.zone === 'public') return '选择自己的非公共区棋子';
    if (u.items.length >= RULES.itemSlots) return '装备槽已满';
    if (p.items[item.slot] !== item.id) return '装备背包已变化';
    return '';
  }
  private equip(id: string | undefined, item: { slot: number; id: string }): void {
    const reason = this.equipReason(id, item);
    if (reason) {
      this.mode = 'equipment';
      this.hud.showNotice(reason);
      this.host.changed();
      return;
    }
    const u = this.host.state()!.units[id!];
    this.selectedId = u.id;
    this.selectedVersion = u.version;
    this.selectedItem = null;
    this.submit({
      type: 'equip',
      unitId: u.id,
      unitVersion: u.version,
      itemSlot: item.slot,
      itemId: item.id,
    });
  }
  select(id: string): void {
    const u = this.host.state()?.units[id];
    if (!u) return;
    this.selectedId = id;
    this.selectedVersion = u.version;
    this.selectedItem = null;
    this.mode = 'selected';
    this.host.changed();
  }
  swapMode(): void {
    if (this.selectedId && this.canOperate()) {
      this.mode = 'swapping';
      this.hud.showNotice('点击另一枚棋子交换位置');
    }
  }
  private requestSell(id: string, version: number): void {
    const u = this.host.state()?.units[id];
    if (
      !u ||
      u.version !== version ||
      u.ownerId !== this.host.actor() ||
      u.position.zone === 'public' ||
      !this.canOperate()
    ) {
      this.mode = this.selectedId ? 'selected' : 'idle';
      this.hud.showNotice('棋子状态已更新，无法出售');
      this.host.changed();
      return;
    }
    this.selectedId = id;
    this.selectedVersion = version;
    this.sellCandidate = { id, version };
    this.mode = 'confirming-sell';
    this.hud.showSellConfirm(u);
    this.host.changed();
  }
  confirmSell(): void {
    const candidate = this.sellCandidate,
      u = candidate ? this.host.state()?.units[candidate.id] : undefined;
    if (
      !candidate ||
      !u ||
      u.version !== candidate.version ||
      u.ownerId !== this.host.actor() ||
      u.position.zone === 'public' ||
      !this.canOperate()
    ) {
      this.cancelSell();
      this.hud.showNotice('棋子状态已更新，无法出售');
      return;
    }
    this.sellCandidate = null;
    this.hud.hideSellConfirm();
    this.mode = 'selected';
    this.submit({ type: 'sell', unitId: u.id, unitVersion: u.version });
  }
  cancelSell(): void {
    this.sellCandidate = null;
    this.hud.hideSellConfirm();
    this.mode = this.selectedId ? 'selected' : 'idle';
    this.host.changed();
  }
  submit(command: Omit<Command, 'commandId' | 'round'>): void {
    if (this.pendingId) return;
    const id = this.host.send(command);
    if (id) {
      this.pendingId = id;
      this.mode = 'pending';
      this.hud.setBusy(true);
    }
    this.host.changed();
  }
  acknowledge(result: CommandResult): void {
    if (result.commandId !== this.pendingId) return;
    this.pendingId = null;
    this.hud.setBusy(false);
    const u = this.host.state()?.units[this.selectedId ?? ''];
    if (u) {
      this.selectedVersion = u.version;
      this.mode = 'selected';
    } else {
      this.selectedId = null;
      this.selectedVersion = null;
      this.mode = 'idle';
    }
    this.host.changed();
  }
  reconcile(): void {
    const s = this.host.state();
    if (!s) return;
    if (!this.canOperate() && (this.pointer || this.selectedId || this.selectedItem)) {
      this.cancel();
      return;
    }
    const source = this.pointer?.unitId ? s.units[this.pointer.unitId] : null;
    if (this.pointer?.unitId && (!source || source.version !== this.pointer.version)) {
      this.cancel();
      this.hud.showNotice('棋子已被移动、合成或转交');
      return;
    }
    const u = s.units[this.selectedId ?? ''];
    if (this.selectedId && (!u || u.version !== this.selectedVersion)) {
      if (this.mode === 'pending') {
        if (u) this.selectedVersion = u.version;
        else this.selectedId = null;
        return;
      }
      this.cancel();
      this.hud.showNotice('棋子状态已更新');
      return;
    }
    if (
      this.selectedItem &&
      s.players[this.host.actor()]?.items[this.selectedItem.slot] !== this.selectedItem.id
    ) {
      this.cancel();
      this.hud.showNotice('装备背包已更新');
    }
  }
  private finishPointer(): void {
    const p = this.pointer;
    this.pointer = null;
    clearTimeout(this.hold);
    if (p?.capture.hasPointerCapture(p.id)) p.capture.releasePointerCapture(p.id);
    this.scene.setPreview(null);
    this.scene.highlight(null, false);
    this.hud.setDragging(false);
    this.scene.lockCamera(false);
  }
  cancel(): void {
    this.finishPointer();
    this.sellCandidate = null;
    this.hud.hideSellConfirm();
    this.selectedId = null;
    this.selectedVersion = null;
    this.selectedItem = null;
    this.mode = this.pendingId ? 'pending' : 'idle';
    this.host.changed();
  }
  dispose(): void {
    clearTimeout(this.hold);
    this.finishPointer();
    for (const off of this.disposers) off();
  }
}
