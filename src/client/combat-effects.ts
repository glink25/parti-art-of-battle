import * as THREE from 'three';
import type { ReplayAction, ReplayDeathBurst } from '../combat/replay';
import type { BattleEvent, CombatAction } from '../domain/types';
import { UNIT_BY_ID } from '../content';
import type { GameResources } from './resources';
import { UNIT_ART } from './art/registry';
import { EffectLibrary, type EffectInstance } from './art/effects/runtime';
import {
  EventLedger,
  stableSeed,
  type EffectRecipe,
  type EffectTiming,
  type TextureMotif,
} from './art/effects/types';

export interface EffectUnit {
  id: string;
  defId: string;
  shield?: number;
  stunUntil?: number;
  poisonUntil?: number;
  buffUntil?: number;
  silencedUntil?: number;
  tauntedUntil?: number;
  itemsDisabledUntil?: number;
  immunityUntil?: number;
  armorDebuff?: number;
  extremeTriggered?: boolean;
  deathAt?: number | null;
}
type Anchor = (id: string, kind?: 'attack' | 'skill') => THREE.Vector3 | undefined;
interface Active {
  instance: EffectInstance;
  timing: EffectTiming;
  source: string;
  target?: string;
  kind?: 'attack' | 'skill';
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius: number;
  follow: boolean;
  released: boolean;
  priority: number;
  wallBorn?: number;
  impactConfirmed: boolean;
}
const world = (x = 4.5, y = 4.5, h = 0.5) => new THREE.Vector3(x - 4.5, h, y - 4.5);
const feedbackRecipe = (
  name: string,
  texture: TextureMotif,
  choreography: EffectRecipe['choreography'] = 'bloom',
): EffectRecipe => ({
  signature: name,
  choreography,
  texture,
  secondary: texture,
  width: 0.5,
  particles: 7,
  linger: 12,
  arc: 0,
  turns: 1,
  spread: 1,
});

/** Read-only adapter from deterministic combat events to the shared art runtime. */
export class CombatEffects {
  private library: EffectLibrary;
  private active = new Map<string, Active>();
  private statuses = new Map<string, Active>();
  private ledger = new EventLedger();
  private poisonMotif = new Map<string, TextureMotif>();
  private shieldArt = new Map<string, string>();
  private tick = 0;
  private tickTime = 0;
  private anchor: Anchor = () => undefined;
  constructor(
    private scene: THREE.Scene,
    _resources: GameResources,
    library?: EffectLibrary,
  ) {
    this.library = library ?? new EffectLibrary();
  }
  private remove(key: string): void {
    const effect = this.active.get(key);
    if (effect) this.library.release(effect.instance);
    this.active.delete(key);
  }
  private add(
    key: string,
    defId: string,
    recipe: EffectRecipe,
    timing: EffectTiming,
    source: string,
    to: THREE.Vector3,
    radius: number,
    kind?: 'attack' | 'skill',
    target?: string,
  ): Active | undefined {
    const old = this.active.get(key);
    if (old) return old;
    const priority = kind === 'skill' ? 2 : kind === 'attack' ? 1 : 0;
    if (this.active.size >= 80) {
      const victim = [...this.active].find(([, e]) => e.priority < priority);
      if (!victim) return undefined;
      this.remove(victim[0]);
    }
    const art = UNIT_ART[defId];
    if (!art) return;
    const instance = this.library.acquire(recipe, art, stableSeed(key));
    this.scene.add(instance.group);
    const e: Active = {
      instance,
      timing,
      source,
      target,
      kind,
      from: this.anchor(source, kind)?.clone() ?? to.clone(),
      to: to.clone(),
      radius,
      follow: kind === 'attack',
      released: false,
      priority,
      impactConfirmed: kind === undefined,
    };
    this.active.set(key, e);
    return e;
  }
  private action(source: string, defId: string, a: CombatAction, position?: THREE.Vector3): void {
    const def = UNIT_BY_ID[defId];
    if (!def || (a.kind === 'attack' && def.noAttack)) return;
    const recipe = UNIT_ART[defId][a.kind];
    const self =
      a.kind === 'skill' &&
      (['buff', 'transform', 'summon'].includes(def.skill.kind) ||
        (def.skill.kind === 'shield' && def.skill.effects.some((e) => e.target === 'allAllies')));
    const to = self
      ? (this.anchor(source) ?? position ?? world(a.targetX, a.targetY))
      : a.kind === 'attack' || ['heal', 'shield', 'execute', 'silence'].includes(def.skill.kind)
        ? (this.anchor(a.targetId ?? '') ?? world(a.targetX, a.targetY))
        : world(a.targetX, a.targetY, 0.1);
    const active = this.add(
      `${source}:${a.id}`,
      defId,
      recipe,
      {
        start: a.startedAt,
        release: a.releaseAt,
        impact: a.impactAt,
        end: Math.max(a.recoverAt, a.impactAt + recipe.linger),
      },
      source,
      to,
      a.kind === 'skill' && !self ? def.skill.radius : 0.65,
      a.kind,
      a.targetId,
    );
    if (active && a.impactAt <= this.tick) active.impactConfirmed = true;
  }
  sync(
    units: EffectUnit[],
    actions: ReplayAction[],
    _deathBursts: ReplayDeathBurst[],
    tick: number,
    anchor: Anchor,
  ): void {
    if (tick < this.tick || tick - this.tick > 8) this.clear();
    this.tick = tick;
    this.tickTime = performance.now();
    this.anchor = anchor;
    for (const a of actions) this.action(a.sourceId, a.defId, a.action, world(a.x, a.y));
    for (const burst of _deathBursts) {
      const recipe = feedbackRecipe('death-warning', 'acid', 'quake');
      this.add(
        `death-warning:${burst.sourceId}:${burst.impactAt}`,
        burst.defId,
        recipe,
        { start: tick, release: burst.impactAt, impact: burst.impactAt, end: burst.impactAt },
        burst.sourceId,
        world(burst.x, burst.y, 0.1),
        0.6,
      );
    }
    const wanted = new Set<string>();
    for (const unit of units) {
      const specs: [string, boolean, TextureMotif, EffectRecipe['choreography']][] = [
        ['shield', (unit.shield ?? 0) > 0, 'sigil', 'ward'],
        ['stun', (unit.stunUntil ?? 0) > tick, 'crystal', 'seal'],
        [
          'poison',
          (unit.poisonUntil ?? 0) > tick,
          this.poisonMotif.get(unit.id) ?? 'acid',
          'breath',
        ],
        ['buff', (unit.buffUntil ?? 0) > tick, 'slash', 'ascend'],
        ['silence', (unit.silencedUntil ?? 0) > tick, 'sigil', 'seal'],
        ['disabled', (unit.itemsDisabledUntil ?? 0) > tick, 'lightning', 'seal'],
        ['taunt', (unit.tauntedUntil ?? 0) > tick, 'web', 'web'],
        ['armorBreak', (unit.armorDebuff ?? 0) > 0, 'acid', 'seal'],
        ['extreme', !!unit.extremeTriggered, 'fire', 'ascend'],
        ['immunity', (unit.immunityUntil ?? 0) > tick, 'water', 'ward'],
        ['linger', unit.deathAt != null && unit.deathAt > tick, 'soul', 'ascend'],
      ];
      for (const [name, on, motif, mode] of specs) {
        if (!on) continue;
        const key = `${unit.id}:${name}`;
        wanted.add(key);
        if (this.statuses.has(key) || this.statuses.size >= 96) continue;
        const artId = name === 'shield' ? (this.shieldArt.get(unit.id) ?? unit.defId) : unit.defId;
        const recipe = feedbackRecipe(`state:${name}`, motif, mode);
        recipe.particles = 3;
        recipe.width = name === 'shield' ? 0.48 : 0.26;
        if (name === 'shield' && artId === 'turtle') recipe.texture = 'water';
        const instance = this.library.acquire(recipe, UNIT_ART[artId], stableSeed(key));
        this.scene.add(instance.group);
        this.statuses.set(key, {
          instance,
          timing: { start: 0, release: 0, impact: 0, end: 1 },
          source: unit.id,
          from: new THREE.Vector3(),
          to: new THREE.Vector3(),
          radius: 0.45,
          follow: true,
          released: true,
          priority: 1,
          impactConfirmed: true,
        });
      }
      if ((unit.poisonUntil ?? 0) <= tick) this.poisonMotif.delete(unit.id);
      if ((unit.shield ?? 0) <= 0) this.shieldArt.delete(unit.id);
    }
    for (const [key, e] of this.statuses)
      if (!wanted.has(key)) {
        this.library.release(e.instance);
        this.statuses.delete(key);
      }
  }
  events(events: BattleEvent[], defIdFor: (id: string) => string | undefined): void {
    for (const event of events) {
      const key = `${event.source}:${event.actionId ?? ''}:${event.kind}:${event.target ?? ''}:${event.status ?? ''}:${event.tick}`;
      if (!this.ledger.accept(key, event.tick)) continue;
      const defId = defIdFor(event.source) ?? defIdFor(event.target ?? '');
      if (!defId) continue;
      const actionKey = `${event.source}:${event.actionId}`;
      if (event.kind === 'actionCancel') {
        this.remove(actionKey);
        continue;
      }
      if (
        event.kind === 'actionStart' ||
        event.kind === 'actionRelease' ||
        event.kind === 'actionImpact'
      ) {
        if (!this.active.has(actionKey)) {
          const kind = event.action ?? 'attack',
            timing =
              kind === 'skill' ? UNIT_BY_ID[defId].skill.timing : UNIT_BY_ID[defId].attackTiming;
          const release =
            event.releaseTick ??
            (event.kind === 'actionStart' ? event.tick + timing.windupTicks : event.tick);
          this.action(event.source, defId, {
            id: event.actionId ?? 0,
            kind,
            skillKind: event.skillKind,
            targetId: event.target,
            targetX: event.x ?? 4.5,
            targetY: event.y ?? 4.5,
            startedAt: release - timing.windupTicks,
            releaseAt: release,
            impactAt: event.impactTick ?? release + timing.travelTicks,
            recoverAt: event.recoverTick ?? release + timing.travelTicks + timing.recoveryTicks,
            released: event.kind !== 'actionStart',
            power: 0,
            physical: kind === 'attack',
            critical: false,
          });
        }
        const e = this.active.get(actionKey);
        if (e && event.kind === 'actionImpact') {
          e.timing.impact = event.tick;
          e.impactConfirmed = true;
          if (event.action === 'attack') e.to = this.anchor(event.target ?? '') ?? e.to;
          e.follow = false;
        }
        continue;
      }
      if (event.kind === 'statusApply' && event.status === 'poison' && event.target)
        this.poisonMotif.set(event.target, defId === 'flame' ? 'fire' : 'acid');
      if (event.kind === 'shield' && event.target) {
        this.shieldArt.set(event.target, defId);
        const key = `${event.target}:shield`,
          old = this.statuses.get(key);
        if (old) {
          this.library.release(old.instance);
          this.statuses.delete(key);
        }
      }
      if (event.kind === 'statusApply' && event.status === 'poison' && event.target) {
        const key = `${event.target}:poison`,
          old = this.statuses.get(key);
        if (old) {
          this.library.release(old.instance);
          this.statuses.delete(key);
        }
      }
      const motifs: Partial<
        Record<BattleEvent['kind'], [TextureMotif, EffectRecipe['choreography']]>
      > = {
        heal: ['leaf', 'mend'],
        shield: ['sigil', 'ward'],
        shieldAbsorb: ['water', 'ward'],
        shieldBreak: ['crystal', 'prism'],
        critical: ['slash', 'cut'],
        death: ['soul', 'ascend'],
        spawn: [UNIT_ART[defId].skill.texture, 'portal'],
        entry: ['feather', 'phase'],
        deathBurstImpact: ['acid', 'quake'],
      };
      let spec = motifs[event.kind];
      if (event.kind === 'statusApply' && event.status === 'energy') spec = ['sigil', 'bloom'];
      if (!spec) continue;
      const target =
        event.kind === 'death' || event.kind === 'deathBurstImpact'
          ? event.source
          : (event.target ?? event.source);
      const to = this.anchor(target) ?? world(event.x, event.y);
      const recipe = feedbackRecipe(event.kind, ...spec);
      if (event.kind === 'shield' && defId === 'turtle') recipe.texture = 'water';
      this.add(
        key,
        defId,
        recipe,
        {
          start: event.tick,
          release: event.tick,
          impact: event.tick,
          end: event.tick + recipe.linger,
        },
        event.source,
        to,
        0.55,
        undefined,
        target,
      );
    }
  }
  upgrade(point: THREE.Vector3, defId: string, star: number): void {
    const recipe = feedbackRecipe('upgrade', 'crystal', 'ascend');
    recipe.width = star === 3 ? 0.9 : 0.6;
    const effect = this.add(
      `upgrade:${defId}:${performance.now()}`,
      defId,
      recipe,
      { start: this.tick, release: this.tick, impact: this.tick, end: this.tick + 18 },
      '',
      point,
      0.7,
    );
    if (effect) effect.wallBorn = performance.now();
  }
  draw(time: number): void {
    // Replay snapshots are four ticks apart. Bound interpolation when delivery stalls.
    const playhead = this.tick + Math.min(3.999, Math.max(0, (time - this.tickTime) / 50));
    this.sample(playhead, time);
  }
  sample(playhead: number, wallTime = performance.now()): void {
    const detail = this.active.size > 40 ? 0.25 : this.active.size > 20 ? 0.5 : 1;
    for (const [key, e] of this.active) {
      const at =
        e.wallBorn === undefined ? playhead : e.timing.start + (wallTime - e.wallBorn) / 50;
      if (at >= e.timing.end) {
        this.remove(key);
        continue;
      }
      const anchor = this.anchor(e.source, e.kind);
      if (
        anchor &&
        (!e.released ||
          ['breath', 'lightning', 'cut', 'cleave', 'sweep'].includes(
            e.instance.recipe.choreography,
          ))
      )
        e.from.copy(anchor);
      if (playhead >= e.timing.release) e.released = true;
      if (e.follow && playhead < e.timing.impact && e.target) {
        const target = this.anchor(e.target);
        if (target) e.to.copy(target);
      }
      e.instance.sample(
        e.impactConfirmed ? at : Math.min(at, e.timing.impact - 0.001),
        e.timing,
        e.from,
        e.to,
        e.radius,
        detail,
      );
    }
    for (const [key, e] of this.statuses) {
      const anchor = this.anchor(e.source);
      if (!anchor) {
        e.instance.group.visible = false;
        continue;
      }
      e.to.copy(anchor);
      if (key.endsWith(':stun') || key.endsWith(':silence') || key.endsWith(':disabled'))
        e.to.y += 1;
      // Stable small state marker; a subtle phase drift avoids repetitive explosion loops.
      const p = 0.12 + Math.sin(playhead * 0.08) * 0.025;
      e.instance.sample(p, { start: 0, release: 0, impact: 0, end: 1 }, e.to, e.to, 0.4, 0.15);
    }
  }
  clear(): void {
    for (const e of this.active.values()) this.library.release(e.instance);
    for (const e of this.statuses.values()) this.library.release(e.instance);
    this.active.clear();
    this.statuses.clear();
    this.ledger.clear();
    this.poisonMotif.clear();
    this.shieldArt.clear();
    this.tick = 0;
  }
  dispose(): void {
    this.clear();
    this.library.dispose();
  }
}
