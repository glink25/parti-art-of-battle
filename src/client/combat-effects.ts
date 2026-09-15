import * as THREE from 'three';
import type { ReplayAction, ReplayDeathBurst } from '../combat/replay';
import type { BattleEvent } from '../domain/types';
import { UNIT_BY_ID } from '../content';
import { GameResources } from './resources';

export interface EffectUnit {
  id: string;
  defId: string;
  shield?: number;
  stunUntil?: number;
  poisonUntil?: number;
  buffUntil?: number;
  deathAt?: number | null;
}
interface Transient {
  object: THREE.Object3D;
  born: number;
  until: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  targetId?: string;
  arc: number;
  grow: number;
  spin: number;
  actionKey?: string;
}
interface Persistent {
  object: THREE.Object3D;
  targetId: string;
  kind: string;
}
interface Telegraph {
  object: THREE.Object3D;
  sourceId: string;
  actionId: number;
  untilTick: number;
  baseScale: THREE.Vector3;
}

/** Presentation-only deterministic combat effects. No effect can alter replay state. */
export class CombatEffects {
  private materials = new Map<string, THREE.MeshBasicMaterial>();
  private transient: Transient[] = [];
  private persistent = new Map<string, Persistent>();
  private telegraphs = new Map<string, Telegraph>();
  private actionProjectiles = new Set<string>();
  private tick = 0;
  private tickTime = 0;
  private anchor: (id: string) => THREE.Vector3 | undefined = () => undefined;
  constructor(
    private scene: THREE.Scene,
    private resources: GameResources,
  ) {}
  private material(color: number, opacity = 0.75): THREE.MeshBasicMaterial {
    const key = `${color}:${opacity}`;
    let material = this.materials.get(key);
    if (!material) {
      material = new THREE.MeshBasicMaterial({
        color,
        transparent: opacity < 1,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.materials.set(key, material);
    }
    return material;
  }
  private world(x = 4.5, y = 4.5, height = 0.35): THREE.Vector3 {
    return new THREE.Vector3(x - 4.5, height, y - 4.5);
  }
  private ring(color: number, radius = 0.7): THREE.Mesh {
    const mesh = new THREE.Mesh(
      this.resources.geometry(new THREE.TorusGeometry(radius, 0.045, 5, 32)),
      this.material(color, 0.72),
    );
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }
  private statusObject(kind: string, color: number): THREE.Group {
    const group = new THREE.Group();
    if (kind === 'shield') {
      const shell = new THREE.Mesh(
        this.resources.geometry(new THREE.IcosahedronGeometry(0.66, 1)),
        this.material(color, 0.22),
      );
      shell.scale.y = 1.35;
      shell.position.y = 0.65;
      group.add(shell);
    } else {
      const ring = this.ring(color, kind === 'linger' ? 0.58 : 0.46);
      ring.position.y = kind === 'stun' ? 1.35 : 0.25;
      group.add(ring);
      const count = kind === 'poison' ? 5 : 3;
      for (let i = 0; i < count; i++) {
        const mote = new THREE.Mesh(
          this.resources.geometry(
            kind === 'stun'
              ? new THREE.OctahedronGeometry(0.09)
              : new THREE.IcosahedronGeometry(0.075, 0),
          ),
          this.material(color, 0.85),
        );
        const angle = (i / count) * Math.PI * 2;
        mote.position.set(
          Math.cos(angle) * 0.42,
          kind === 'poison' ? 0.45 : 1.35,
          Math.sin(angle) * 0.42,
        );
        group.add(mote);
      }
    }
    this.scene.add(group);
    return group;
  }
  private color(defId: string, skill = false): number {
    const visual = UNIT_BY_ID[defId]?.combatVisual;
    return skill ? (visual?.secondary ?? 0xffd783) : (visual?.primary ?? 0xffffff);
  }
  private projectile(defId: string, skill: boolean): THREE.Object3D {
    const visual = UNIT_BY_ID[defId].combatVisual,
      id = skill ? visual.skill : visual.attack,
      color = skill ? visual.secondary : visual.primary;
    const geometry = /shell|boulder|spit|pool|bombard|burst/.test(id)
      ? new THREE.IcosahedronGeometry(0.13, 0)
      : /shot|tracer|rail|arc/.test(id)
        ? new THREE.CylinderGeometry(0.035, 0.065, 0.45, 5)
        : /talisman|spirit|orb|spark|bolt|wave/.test(id)
          ? new THREE.OctahedronGeometry(0.12)
          : new THREE.ConeGeometry(0.1, 0.28, 5);
    const group = new THREE.Group(),
      core = new THREE.Mesh(this.resources.geometry(geometry), this.material(color, 0.95)),
      glow = new THREE.Mesh(
        this.resources.geometry(new THREE.IcosahedronGeometry(0.2, 0)),
        this.material(visual.secondary, 0.22),
      );
    if (/shot|tracer|rail|arc/.test(id)) core.rotation.x = Math.PI / 2;
    group.add(glow, core);
    return group;
  }
  private burst(
    point: THREE.Vector3,
    color: number,
    large = false,
    born = performance.now(),
  ): void {
    if (this.transient.length >= 96) return;
    const group = new THREE.Group(),
      ring = this.ring(color, large ? 0.75 : 0.38);
    group.add(ring);
    const count = large ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const particle = new THREE.Mesh(
        this.resources.geometry(new THREE.OctahedronGeometry(large ? 0.09 : 0.055)),
        this.material(color, 0.88),
      );
      const angle = (i / count) * Math.PI * 2,
        radius = large ? 0.75 : 0.42;
      particle.position.set(
        Math.cos(angle) * radius,
        0.15 + (i % 3) * 0.08,
        Math.sin(angle) * radius,
      );
      group.add(particle);
    }
    group.position.copy(point);
    this.scene.add(group);
    this.transient.push({
      object: group,
      born,
      until: born + (large ? 650 : 380),
      from: point.clone(),
      to: point.clone(),
      arc: 0,
      grow: large ? 1.2 : 0.7,
      spin: large ? 2.2 : 1.2,
    });
  }
  private beam(from: THREE.Vector3, to: THREE.Vector3, color: number, born: number): void {
    if (this.transient.length >= 96) return;
    const delta = to.clone().sub(from),
      mesh = new THREE.Mesh(
        this.resources.geometry(new THREE.CylinderGeometry(0.035, 0.07, 1, 5)),
        this.material(color, 0.9),
      );
    mesh.scale.y = delta.length();
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    this.scene.add(mesh);
    this.transient.push({
      object: mesh,
      born,
      until: born + 180,
      from: mesh.position.clone(),
      to: mesh.position.clone(),
      arc: 0,
      grow: 0.25,
      spin: 0,
    });
  }
  private ensureTelegraph(action: ReplayAction): void {
    if (action.action.kind !== 'skill' || action.action.impactAt <= this.tick) return;
    const key = `${action.sourceId}:${action.action.id}`;
    if (this.telegraphs.has(key) || this.telegraphs.size >= 24) return;
    const def = UNIT_BY_ID[action.defId],
      radius = Math.max(0.5, def.skill.radius + 0.25),
      color = this.color(action.defId, true),
      visual = def.combatVisual.skill;
    let warning: THREE.Object3D;
    if (/rail|dash/.test(visual)) {
      const from = this.world(action.x, action.y, 0.24),
        to = this.world(action.action.targetX, action.action.targetY, 0.24),
        delta = to.clone().sub(from),
        line = new THREE.Mesh(
          this.resources.geometry(new THREE.CylinderGeometry(0.055, 0.055, 1, 5)),
          this.material(color, 0.68),
        );
      line.scale.y = delta.length();
      line.position.copy(from).add(to).multiplyScalar(0.5);
      line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
      warning = line;
    } else {
      const group = new THREE.Group(),
        outer = this.ring(color, radius);
      group.add(outer);
      if (/sigil|rift|gate|strike|hexguard|aegis|energy|overdrive/.test(visual)) {
        const inner = this.ring(def.combatVisual.primary, Math.max(0.3, radius * 0.62));
        inner.rotation.z = Math.PI / 4;
        group.add(inner);
      }
      group.position.copy(this.world(action.action.targetX, action.action.targetY, 0.22));
      warning = group;
    }
    this.scene.add(warning);
    this.telegraphs.set(key, {
      object: warning,
      sourceId: action.sourceId,
      actionId: action.action.id,
      untilTick: action.action.impactAt,
      baseScale: warning.scale.clone(),
    });
  }
  sync(
    units: EffectUnit[],
    actions: ReplayAction[],
    deathBursts: ReplayDeathBurst[],
    tick: number,
    anchor: (id: string) => THREE.Vector3 | undefined,
  ): void {
    if (this.tick && (tick < this.tick || tick - this.tick > 8)) this.clear();
    this.tick = tick;
    this.tickTime = performance.now();
    this.anchor = anchor;
    const desired = new Map<string, { unit: EffectUnit; kind: string; color: number }>();
    for (const unit of units) {
      if ((unit.shield ?? 0) > 0)
        desired.set(`${unit.id}:shield`, { unit, kind: 'shield', color: 0x70e6ed });
      if ((unit.stunUntil ?? 0) > tick)
        desired.set(`${unit.id}:stun`, { unit, kind: 'stun', color: 0xffda61 });
      if ((unit.poisonUntil ?? 0) > tick)
        desired.set(`${unit.id}:poison`, { unit, kind: 'poison', color: 0x82dc54 });
      if ((unit.buffUntil ?? 0) > tick)
        desired.set(`${unit.id}:buff`, { unit, kind: 'buff', color: 0xffa74f });
      if (unit.deathAt !== null && unit.deathAt !== undefined && unit.deathAt > tick)
        desired.set(`${unit.id}:linger`, { unit, kind: 'linger', color: 0xbe83ff });
    }
    for (const [key, current] of this.persistent)
      if (!desired.has(key)) {
        this.scene.remove(current.object);
        this.persistent.delete(key);
      }
    for (const [key, item] of desired)
      if (!this.persistent.has(key))
        this.persistent.set(key, {
          object: this.statusObject(item.kind, item.color),
          targetId: item.unit.id,
          kind: item.kind,
        });
    const actionKeys = new Set([
      ...actions.map((a) => `${a.sourceId}:${a.action.id}`),
      ...deathBursts.map((burst) => `death:${burst.sourceId}:${burst.impactAt}`),
    ]);
    for (const [key, telegraph] of this.telegraphs)
      if (!actionKeys.has(key) || telegraph.untilTick <= tick) {
        this.scene.remove(telegraph.object);
        this.telegraphs.delete(key);
      }
    for (const action of actions) {
      this.ensureTelegraph(action);
      const key = `${action.sourceId}:${action.action.id}`;
      if (
        action.action.released &&
        action.action.impactAt > tick &&
        action.action.impactAt > action.action.releaseAt &&
        !this.actionProjectiles.has(key) &&
        this.transient.length < 96
      ) {
        const object = this.projectile(action.defId, action.action.kind === 'skill'),
          from = this.world(action.x, action.y, 1),
          to = this.world(action.action.targetX, action.action.targetY, 0.9),
          born = this.tickTime - (tick - action.action.releaseAt) * 50;
        object.position.copy(from);
        this.scene.add(object);
        this.transient.push({
          object,
          born,
          until: this.tickTime + (action.action.impactAt - tick) * 50,
          from,
          to,
          targetId: action.action.kind === 'attack' ? action.action.targetId : undefined,
          arc: /shell|boulder|spit|burst|bombard/.test(
            action.action.kind === 'skill'
              ? UNIT_BY_ID[action.defId].combatVisual.skill
              : UNIT_BY_ID[action.defId].combatVisual.attack,
          )
            ? 1.6
            : 0.25,
          grow: 0,
          spin: 8,
          actionKey: key,
        });
        this.actionProjectiles.add(key);
      }
    }
    for (const burst of deathBursts) {
      const key = `death:${burst.sourceId}:${burst.impactAt}`;
      if (this.telegraphs.has(key) || this.telegraphs.size >= 24) continue;
      const warning = this.ring(0xff7048, 1.25);
      warning.position.copy(this.world(burst.x, burst.y, 0.35));
      this.scene.add(warning);
      this.telegraphs.set(key, {
        object: warning,
        sourceId: burst.sourceId,
        actionId: -1,
        untilTick: burst.impactAt,
        baseScale: warning.scale.clone(),
      });
    }
  }
  events(events: BattleEvent[], defIdFor: (id: string) => string | undefined): void {
    const now = performance.now();
    for (const event of events) {
      const defId = defIdFor(event.source) ?? defIdFor(event.target ?? '');
      if (!defId) continue;
      const groundSkill = ['damage', 'stun', 'poison', 'dash'].includes(event.skillKind ?? '');
      const source = this.anchor(event.source) ?? this.world(event.x, event.y, 0.65),
        target = groundSkill
          ? this.world(event.x, event.y, 0.35)
          : (this.anchor(event.target ?? '') ?? this.world(event.x, event.y, 0.35)),
        born = now - Math.max(0, this.tick - event.tick) * 50,
        color = this.color(defId, event.action === 'skill' || !!event.skillKind);
      if (event.kind === 'entry') {
        const object = this.projectile(defId, true),
          from = this.world(event.x, event.y, 0.55),
          to = source.clone().add(new THREE.Vector3(0, 0.45, 0));
        object.scale.setScalar(1.8);
        this.scene.add(object);
        this.transient.push({
          object,
          born,
          until: born + 360,
          from,
          to,
          arc: 1.4,
          grow: 0,
          spin: 10,
        });
        this.burst(to, color, true, born + 260);
      }
      if (event.kind === 'actionRelease') {
        const travel = Math.max(0, (event.impactTick ?? event.tick) - event.tick) * 50;
        const actionKey = `${event.source}:${event.actionId}`;
        if (travel > 0 && !this.actionProjectiles.has(actionKey)) {
          const object = this.projectile(defId, event.action === 'skill');
          object.position.copy(source).add(new THREE.Vector3(0, 0.65, 0));
          this.scene.add(object);
          this.transient.push({
            object,
            born,
            until: born + travel,
            from: object.position.clone(),
            to: target.clone().add(new THREE.Vector3(0, 0.55, 0)),
            targetId: event.action === 'attack' ? event.target : undefined,
            arc: /shell|boulder|spit|burst|bombard/.test(
              event.action === 'skill'
                ? UNIT_BY_ID[defId].combatVisual.skill
                : UNIT_BY_ID[defId].combatVisual.attack,
            )
              ? 1.6
              : 0.25,
            grow: 0,
            spin: 8,
            actionKey,
          });
          this.actionProjectiles.add(actionKey);
        } else if (/rail|beam|strike/.test(UNIT_BY_ID[defId].combatVisual.skill)) {
          this.beam(
            source.clone().add(new THREE.Vector3(0, 0.7, 0)),
            target.clone().add(new THREE.Vector3(0, 0.4, 0)),
            color,
            born,
          );
        }
        this.burst(source.clone().add(new THREE.Vector3(0, 0.55, 0)), color, false, born);
      }
      if (event.kind === 'actionImpact') {
        this.burst(target, color, event.action === 'skill', born);
        const key = `${event.source}:${event.actionId}`,
          telegraph = this.telegraphs.get(key);
        if (telegraph) {
          this.scene.remove(telegraph.object);
          this.telegraphs.delete(key);
        }
      }
      if (event.kind === 'shieldAbsorb')
        this.burst(target.clone().add(new THREE.Vector3(0, 0.5, 0)), 0x77efff, false, born);
      if (event.kind === 'shieldBreak')
        this.burst(target.clone().add(new THREE.Vector3(0, 0.5, 0)), 0xb4ffff, true, born);
      if (event.kind === 'critical')
        this.burst(target.clone().add(new THREE.Vector3(0, 0.6, 0)), 0xfff1a0, true, born);
      if (event.kind === 'deathBurstImpact') this.burst(source, 0xff7048, true, born);
      if (event.kind === 'death') this.burst(source, this.color(defId), true, born);
      if (event.kind === 'spawn') this.burst(target, 0xb88cff, true, born);
      if (event.kind === 'heal')
        this.burst(target.clone().add(new THREE.Vector3(0, 0.35, 0)), 0x70f0ae, false, born);
      if (event.kind === 'statusApply' && event.status === 'energy')
        this.burst(target, 0x76efff, false, born);
    }
  }
  draw(time: number): void {
    const playhead = this.tick + (time - this.tickTime) / 50;
    for (let i = this.transient.length - 1; i >= 0; i--) {
      const effect = this.transient[i];
      if (time >= effect.until) {
        this.scene.remove(effect.object);
        if (effect.actionKey) this.actionProjectiles.delete(effect.actionKey);
        this.transient.splice(i, 1);
        continue;
      }
      const progress = Math.max(
        0,
        Math.min(1, (time - effect.born) / (effect.until - effect.born)),
      );
      if (effect.targetId) {
        const anchor = this.anchor(effect.targetId);
        if (anchor) effect.to.copy(anchor).add(new THREE.Vector3(0, 0.55, 0));
      }
      effect.object.position.lerpVectors(effect.from, effect.to, progress);
      effect.object.position.y += Math.sin(progress * Math.PI) * effect.arc;
      effect.object.rotation.y += effect.spin * 0.016;
      if (effect.grow) effect.object.scale.setScalar(0.65 + progress * effect.grow);
    }
    for (const effect of this.persistent.values()) {
      const anchor = this.anchor(effect.targetId);
      if (anchor) effect.object.position.copy(anchor);
      effect.object.rotation.y = time / (effect.kind === 'stun' ? 260 : 520);
      const pulse = 1 + Math.sin(time / 120) * 0.06;
      effect.object.scale.setScalar(pulse);
    }
    for (const telegraph of this.telegraphs.values()) {
      const remaining = Math.max(0, telegraph.untilTick - playhead),
        pulse = 1 + Math.sin(time / 90) * Math.min(0.12, 1 / Math.max(1, remaining));
      telegraph.object.scale.copy(telegraph.baseScale).multiplyScalar(pulse);
    }
  }
  clear(): void {
    for (const effect of this.transient) this.scene.remove(effect.object);
    for (const effect of this.persistent.values()) this.scene.remove(effect.object);
    for (const effect of this.telegraphs.values()) this.scene.remove(effect.object);
    this.transient = [];
    this.persistent.clear();
    this.telegraphs.clear();
    this.actionProjectiles.clear();
  }
  dispose(): void {
    this.clear();
    for (const material of this.materials.values()) material.dispose();
    this.materials.clear();
  }
}
