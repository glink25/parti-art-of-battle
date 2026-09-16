import type { Command, CommandResult, GameState } from '../domain/types';
import { CONTENT_HASH, RULES } from '../content';
import { createGateway, type GameGateway } from './gateway';
import { GameResources } from './resources';
import { BoardScene } from './scene';
import { GameHud, type HudAction, type UnitDetailView } from './hud/hud';
import { InputController } from './input';
import { ReplayController } from './replay-controller';
import { battlePresentationUnits, preparationUnits } from './presentation';
import type { ReplayFrame } from '../combat/replay';
import type { CombatStatRow } from './combat-stats';
interface Pending {
  actor: string;
  command: Command;
  keys: string[];
  sent: number;
  warned: boolean;
}
export class GameApp {
  private resources = new GameResources();
  private hud: GameHud;
  private scene: BoardScene | null = null;
  private input: InputController | null = null;
  private replay: ReplayController | null = null;
  private gateway: GameGateway | null = null;
  private state: GameState | null = null;
  private view = 'team-0';
  private pending = new Map<string, Pending>();
  private offs: (() => void)[] = [];
  private animation = 0;
  private disposed = false;
  private combatDetails = new Map<string, UnitDetailView>();
  private currentFrame: ReplayFrame | null = null;
  private lastDamage = new Map<string, CombatStatRow[]>();
  constructor(private root: HTMLElement) {
    this.hud = new GameHud(root, this.resources, (name, value) => this.action(name, value));
  }
  async start(): Promise<void> {
    try {
      this.scene = new BoardScene(this.hud.board, this.resources);
      this.hud.onLayout = (safe) => this.scene?.setSafeArea(safe);
      this.hud.layout();
      this.gateway = await createGateway();
      if (this.disposed) {
        this.gateway.dispose();
        return;
      }
      this.hud.setDevelopment(this.gateway.local);
      this.input = new InputController(this.root, this.scene, this.hud, {
        state: () => this.state,
        actor: () => this.gateway?.playerId ?? '',
        view: () => this.view,
        send: (c) => this.send(c),
        changed: () => this.render(),
        detail: (id) => this.detail(id),
      });
      this.replay = new ReplayController(
        this.gateway,
        (frame, events, damage) => {
          this.currentFrame = frame;
          this.updateCombatDetails(frame);
          if (this.state)
            this.scene?.update(
              battlePresentationUnits(this.state, this.view, frame),
              this.input?.selectedId ?? null,
            );
          this.scene?.combatFrame(frame);
          this.scene?.events(events);
          this.lastDamage.set(this.view, damage);
          this.hud.setCombatStats(
            damage,
            false,
            this.state?.phase === 'battle' ? '本场实时' : '上一场',
          );
          this.input?.reconcile();
          this.render();
        },
        (message) => this.hud.showNotice(message),
      );
      this.offs.push(
        this.gateway.onEvent('game:command', (payload) => {
          const result = payload as CommandResult;
          if (!result.ok) this.finish(result);
        }),
      );
      this.offs.push(
        this.gateway.onEvent('game:transport', (message) => this.hud.showNotice(String(message))),
      );
      this.offs.push(this.gateway.subscribe((s) => this.receive(s)));
      this.animation = requestAnimationFrame(() => this.tick());
    } catch (error) {
      this.hud.el('lobby-message').textContent =
        error instanceof Error ? error.message : String(error);
      this.hud.el<HTMLButtonElement>('start').disabled = true;
    }
  }
  private receive(s: GameState): void {
    if (
      s.contentHash !== CONTENT_HASH ||
      s.rulesetId !== RULES.id ||
      s.simulationVersion !== RULES.simulationVersion
    ) {
      this.state = null;
      this.input?.cancel();
      this.replay?.stop();
      this.hud.el('lobby').hidden = false;
      this.hud.el('lobby-message').textContent = '房间版本不一致，请重新进入正确版本';
      this.hud.el<HTMLButtonElement>('start').disabled = true;
      return;
    }
    const old = this.state;
    this.state = s;
    for (const [id, pending] of this.pending) {
      const receipt = s.receipts[pending.actor]?.find((r) => r.commandId === id);
      if (receipt) this.finish(receipt);
    }
    this.input?.reconcile();
    if (old) {
      for (const u of Object.values(s.units)) {
        const before = old.units[u.id];
        if (before && before.star < u.star) {
          this.scene?.pulse(u.id);
          if (u.teamId === 'team-0') this.hud.showPhase('进化完成', `${'★'.repeat(u.star)}`);
        }
      }
    }
    const battle = this.replay?.update(s, this.view);
    if (!battle) {
      this.currentFrame = null;
      this.combatDetails.clear();
      this.scene?.clearCombat();
      this.scene?.update(preparationUnits(s, this.view), this.input?.selectedId ?? null);
      const damage = this.lastDamage.get(this.view);
      this.hud.setCombatStats(damage ?? [], false, damage ? '上一场' : '暂无数据');
    } else if (this.currentFrame) {
      this.scene?.update(
        battlePresentationUnits(s, this.view, this.currentFrame),
        this.input?.selectedId ?? null,
      );
    } else {
      this.scene?.clearCombat();
      this.scene?.update(
        preparationUnits(s, this.view).filter(
          (unit) => s.units[unit.id]?.position.zone !== 'board',
        ),
        this.input?.selectedId ?? null,
      );
    }
    this.render();
  }
  private detail(id: string): UnitDetailView | undefined {
    const u = this.state?.units[id];
    if (u)
      return {
        id: u.id,
        defId: u.defId,
        star: u.star,
        items: u.items,
        ownerName: this.state?.players[u.ownerId]?.name ?? '',
        unit: u,
        readOnly: false,
      };
    return this.combatDetails.get(id);
  }
  private updateCombatDetails(frame: ReplayFrame): void {
    const battle = this.state?.battles.find((candidate) => candidate.id === frame.battleId),
      frozen = new Map(battle?.sides.flat().map((unit) => [unit.id, unit]) ?? []);
    this.combatDetails.clear();
    for (const unit of frame.units) {
      const source = frozen.get(unit.id),
        teamId = battle?.teams[unit.side],
        ownerName =
          battle?.neutral && unit.side === 1
            ? '野外守卫'
            : source
              ? (this.state?.players[source.ownerId]?.name ??
                this.state?.teams[teamId ?? '']?.name ??
                '')
              : '召唤单位';
      this.combatDetails.set(unit.id, {
        id: unit.id,
        defId: unit.defId,
        star: unit.star,
        items: source?.items ?? [],
        ownerName,
        readOnly: true,
      });
    }
  }
  private render(): void {
    if (!this.state || !this.gateway) return;
    this.hud.update(
      this.state,
      this.gateway.playerId ?? '',
      this.view,
      this.input?.selectedId ? this.detail(this.input.selectedId) : undefined,
      this.input?.selectedItem?.slot ?? null,
    );
    this.scene?.setSelection(this.input?.selectedId ?? null);
  }
  private keys(c: Omit<Command, 'commandId' | 'round'>): string[] {
    if (['buy', 'refresh', 'lock'].includes(c.type)) return ['shop'];
    if (c.type === 'xp') return ['xp'];
    if (c.type === 'ready') return ['ready'];
    return [
      c.unitId ? `unit:${c.unitId}` : c.type,
      ...(c.targetId ? [`unit:${c.targetId}`] : []),
      ...(c.type === 'equip' ? ['inventory'] : []),
    ];
  }
  private send(c: Omit<Command, 'commandId' | 'round'>): string | null {
    if (!this.gateway || !this.state) return null;
    const keys = this.keys(c);
    if ([...this.pending.values()].some((p) => p.keys.some((k) => keys.includes(k)))) return null;
    const commandId = this.gateway.command({ ...c, round: this.state.round });
    const command = { ...c, round: this.state.round, commandId };
    this.pending.set(commandId, {
      actor: this.gateway.playerId ?? '',
      command,
      keys,
      sent: performance.now(),
      warned: false,
    });
    return commandId;
  }
  private finish(result: CommandResult): void {
    const pending = this.pending.get(result.commandId);
    if (!pending) {
      if (!result.ok) this.hud.showNotice(result.reason);
      return;
    }
    this.pending.delete(result.commandId);
    if (pending.actor !== this.gateway?.playerId) {
      this.input?.acknowledge(result);
      return;
    }
    if (result.ok) {
      this.hud.feedback(pending.command);
      if (pending.command.unitId) this.scene?.pulse(pending.command.unitId);
    } else this.hud.showNotice(result.reason);
    this.input?.acknowledge(result);
  }
  private action(name: HudAction, value?: string | number): void {
    if (name === 'cancel') {
      this.input?.cancel();
      this.hud.closeTransient();
      return;
    }
    if (name === 'view' || name === 'home') {
      this.view = name === 'home' ? 'team-0' : String(value);
      this.input?.cancel();
      if (this.state) {
        if (!this.replay?.update(this.state, this.view)) {
          this.scene?.update(preparationUnits(this.state, this.view), null);
          const damage = this.lastDamage.get(this.view);
          this.hud.setCombatStats(damage ?? [], false, damage ? '上一场' : '暂无数据');
        } else {
          this.currentFrame = null;
          this.combatDetails.clear();
          this.scene?.clearCombat();
          this.scene?.update(
            preparationUnits(this.state, this.view).filter(
              (unit) => this.state?.units[unit.id]?.position.zone !== 'board',
            ),
            null,
          );
          this.hud.setCombatStats([], true, '本场实时');
        }
        this.render();
      }
      return;
    }
    if (name === 'seat') {
      this.input?.cancel();
      this.gateway?.switchSeat?.();
      return;
    }
    if (name === 'start' || name === 'retry') {
      this.gateway?.send(name);
      return;
    }
    if (name === 'swap-mode') {
      this.input?.swapMode();
      return;
    }
    if (name === 'confirm-sell') {
      this.input?.confirmSell();
      return;
    }
    if (name === 'cancel-sell') {
      this.input?.cancelSell();
      return;
    }
    if (!this.state || !this.gateway) return;
    const p = this.state.players[this.gateway.playerId ?? ''];
    if (!p) return;
    const u = this.state.units[this.input?.selectedId ?? ''];
    if (name === 'buy') {
      this.send({ type: 'buy', slot: Number(value), shopVersion: p.shopVersion });
      return;
    }
    if (name === 'sell' && u) {
      this.input?.submit({ type: 'sell', unitId: u.id, unitVersion: u.version });
      return;
    }
    if (name === 'demand' && u) {
      this.send({ type: 'demand', defId: p.demand === u.defId ? null : u.defId });
      return;
    }
    if (['xp', 'refresh', 'lock', 'ready'].includes(name))
      this.send({ type: name as Command['type'] });
  }
  private tick(): void {
    const time = this.replay?.tick();
    if (time) this.hud.clock(time.remaining, time.active);
    for (const p of this.pending.values()) {
      if (performance.now() - p.sent <= 8000 || p.actor !== this.gateway?.playerId || !this.state)
        continue;
      if (!p.warned) {
        p.warned = true;
        this.hud.showNotice('等待房主确认操作，连接恢复后会自动同步');
      }
      // Resend the original transaction identity; never interpret a timeout as a rejection.
      p.sent = performance.now();
      this.gateway.send('command', p.command);
    }
    this.animation = requestAnimationFrame(() => this.tick());
  }
  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.animation);
    for (const off of this.offs) off();
    this.input?.dispose();
    this.replay?.dispose();
    this.gateway?.dispose();
    this.hud.dispose();
    this.scene?.dispose();
    this.resources.dispose();
  }
}
