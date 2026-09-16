import * as THREE from 'three';
import type { ReplayFrame } from '../combat/replay';
import type { BattleEvent, CombatAction, Position } from '../domain/types';
import { UNIT_BY_ID } from '../content';
import { CombatEffects } from './combat-effects';
import { GameResources } from './resources';
import { positionToWorld } from './presentation';
import { animateUnitModel } from './art/core/model';
import type { UnitModel } from './art/core/types';
import { SelectiveBloom } from './art/core/bloom';
export interface SceneUnit {
  id: string;
  defId: string;
  star: number;
  ownerId: string;
  x: number;
  z: number;
  side: number;
  seat?: number;
  hp?: number;
  maxHp?: number;
  layer?: string;
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
  action?: CombatAction | null;
}
export interface Pick {
  unitId?: string;
  position?: Position;
  seat?: number;
}
export interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
interface View {
  group: THREE.Group;
  model: UnitModel;
  label: HTMLDivElement;
  target: THREE.Vector3;
  data: SceneUnit;
  ring: THREE.Mesh;
  heading: number;
  flash: THREE.Mesh;
  flashUntil: number;
}
export class BoardScene {
  readonly renderer: THREE.WebGLRenderer;
  private composer: SelectiveBloom;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(36, 1, 0.1, 120);
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private views = new Map<string, View>();
  private cells: THREE.Object3D[] = [];
  private overlay: HTMLDivElement;
  private observer: ResizeObserver;
  private animation = 0;
  private last = 0;
  private bounds = { width: 1, height: 1 };
  private safe: SafeArea = { top: 90, bottom: 220, left: 80, right: 150 };
  private resizeLocked = false;
  private origin: THREE.Mesh;
  private destination: THREE.Mesh;
  private preview: { id: string; point: THREE.Vector3 } | null = null;
  private flashMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff0b0,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  private pulses = new Map<string, number>();
  private transients: { node: HTMLElement; point: THREE.Vector3; until: number; born: number }[] =
    [];
  private annotations: HTMLDivElement[] = [];
  private effects: CombatEffects;
  private combatTick = 0;
  private combatTime = 0;
  private defIds = new Map<string, string>();
  private combatId = '';
  private viewedSide: 0 | 1 = 0;
  constructor(
    private container: HTMLElement,
    readonly resources: GameResources,
  ) {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    this.renderer.setClearColor(0x111827);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.append(this.renderer.domElement);
    this.overlay = document.createElement('div');
    this.overlay.className = 'world-overlay';
    container.append(this.overlay);
    this.camera.position.set(0, 13.2, 15.2);
    this.camera.lookAt(0, 0, 1.1);
    this.camera.updateMatrixWorld();
    this.scene.add(new THREE.HemisphereLight(0xdff7ff, 0x211d38, 2.15));
    const sun = new THREE.DirectionalLight(0xffddb0, 2.5);
    sun.position.set(-7, 14, 4);
    this.scene.add(sun);
    this.box(55, 0.3, 55, 0x151c2d, 0, -0.9, 0);
    this.makeBoard();
    this.effects = new CombatEffects(this.scene, resources);
    this.composer = new SelectiveBloom(this.renderer, this.scene, this.camera);
    this.origin = this.marker(0xe8d5a1);
    (this.origin.material as THREE.MeshBasicMaterial).wireframe = true;
    this.destination = this.marker(0x8eeed1);
    this.origin.visible = this.destination.visible = false;
    for (const text of ['A 席 · 私人', '公共交换', 'B 席 · 私人']) {
      const node = document.createElement('div');
      node.className = 'bench-caption';
      node.textContent = text;
      this.overlay.append(node);
      this.annotations.push(node);
    }
    this.observer = new ResizeObserver(() => {
      this.resizeLocked = false;
      this.resize();
    });
    this.observer.observe(container);
    this.resize();
    this.animation = requestAnimationFrame((t) => this.draw(t));
  }
  private geometry<T extends THREE.BufferGeometry>(g: T): T {
    return this.resources.geometry(g);
  }
  private material(color: number, emissive = 0) {
    return this.resources.material(color, emissive);
  }
  private box(
    w: number,
    h: number,
    d: number,
    color: number,
    x: number,
    y: number,
    z: number,
  ): THREE.Mesh {
    const mesh = new THREE.Mesh(
      this.geometry(new THREE.BoxGeometry(w, h, d)),
      this.material(color),
    );
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }
  private marker(color: number): THREE.Mesh {
    const mesh = new THREE.Mesh(
      this.geometry(new THREE.BoxGeometry(0.95, 0.04, 0.95)),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5, depthWrite: false }),
    );
    mesh.position.y = 0.2;
    this.scene.add(mesh);
    return mesh;
  }
  private makeBoard(): void {
    this.box(10.7, 0.5, 10.7, 0x1d263d, 0, -0.4, 0);
    this.box(10.4, 0.16, 10.4, 0x35415b, 0, -0.08, 0);
    // A single presentation rail contains both private benches and the shared handoff cells.
    this.box(10.75, 0.28, 2.45, 0x151c31, 0, -0.2, 6.2);
    this.box(10.55, 0.04, 0.06, 0x44e5dd, 0, 0.02, 5.02);
    this.box(10.55, 0.04, 0.06, 0xff786f, 0, 0.02, 7.38);
    this.box(0.06, 0.06, 2.3, 0xd4ae54, -1, 0.03, 6.2);
    this.box(0.06, 0.06, 2.3, 0xd4ae54, 1, 0.03, 6.2);
    const tiles = new THREE.InstancedMesh(
      this.geometry(new THREE.BoxGeometry(0.96, 0.12, 0.96)),
      this.material(0xffffff),
      120,
    );
    const picks: Pick[] = [];
    const place = (x: number, z: number, color: number, pick: Pick) => {
      const index = picks.length;
      tiles.setMatrixAt(index, new THREE.Matrix4().makeTranslation(x, 0.06, z));
      tiles.setColorAt(index, new THREE.Color(color));
      picks.push(pick);
    };
    for (let y = 0; y < 10; y++)
      for (let x = 0; x < 10; x++)
        place(
          x - 4.5,
          y - 4.5,
          y < 5 ? ((x + y) % 2 ? 0x314d5d : 0x3a6170) : (x + y) % 2 ? 0x523e58 : 0x664550,
          { position: { zone: 'board', x, y } },
        );
    for (let seat = 0; seat < 2; seat++)
      for (let slot = 0; slot < 8; slot++)
        place(
          (seat === 0 ? -4.5 : 1.5) + (slot % 4),
          5.7 + Math.floor(slot / 4),
          seat === 0 ? 0x28697a : 0x375969,
          { position: { zone: 'bench', slot }, seat },
        );
    for (let slot = 0; slot < 4; slot++)
      place(-0.5 + (slot % 2), 5.7 + Math.floor(slot / 2), 0xb18b3f, {
        position: { zone: 'public', slot },
      });
    tiles.userData.picks = picks;
    tiles.instanceMatrix.needsUpdate = true;
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    tiles.computeBoundingSphere();
    this.scene.add(tiles);
    this.cells.push(tiles);
    this.box(10, 0.018, 0.035, 0xe5cf88, 0, 0.13, 0);
    const rock = this.geometry(new THREE.DodecahedronGeometry(1, 0)),
      trunk = this.geometry(new THREE.CylinderGeometry(0.1, 0.18, 0.7, 5)),
      leaves = this.geometry(new THREE.ConeGeometry(0.7, 1.4, 5));
    const rocks = new THREE.InstancedMesh(rock, this.material(0xffffff), 18);
    const transform = new THREE.Object3D();
    for (let i = 0; i < 18; i++) {
      const side = i % 2 === 0 ? -1 : 1,
        z = -5.5 + Math.floor(i / 2) * 1.5;
      transform.scale.set(0.45, 0.3 + (i % 3) * 0.12, 0.65);
      transform.position.set(side * (5.7 + (i % 3) * 0.25), -0.05, z);
      transform.updateMatrix();
      rocks.setMatrixAt(i, transform.matrix);
      rocks.setColorAt(i, new THREE.Color(i % 3 ? 0x344d44 : 0x547366));
      if (i % 3 === 0) {
        const stem = new THREE.Mesh(trunk, this.material(0x65543e));
        stem.position.set(side * 6.3, 0.4, z);
        const crown = new THREE.Mesh(leaves, this.material(i % 2 ? 0x517c62 : 0x698b65));
        crown.position.set(side * 6.3, 1.1, z);
        this.scene.add(stem, crown);
      }
    }
    rocks.instanceMatrix.needsUpdate = true;
    if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;
    rocks.computeBoundingSphere();
    this.scene.add(rocks);
  }
  private model(u: SceneUnit): View {
    const group = new THREE.Group(),
      model = this.resources.unit(u.defId, u.side, u.seat, u.star);
    // Models now stand at local y=0; board tiles have their top at y=.12.
    model.position.y = 0.12;
    group.add(model);
    group.userData.pick = { unitId: u.id };
    const ring = new THREE.Mesh(
      this.geometry(new THREE.TorusGeometry(0.43, 0.035, 5, 32)),
      this.material(0xffdb86, 0x9b701f),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.19;
    ring.visible = false;
    group.add(ring);
    const flash = new THREE.Mesh(
      this.geometry(new THREE.IcosahedronGeometry(0.48, 1)),
      this.flashMaterial,
    );
    flash.position.y = 0.65;
    flash.visible = false;
    group.add(flash);
    const label = document.createElement('div');
    label.className = 'unit-tag';
    label.innerHTML = '<span></span><i><b></b></i>';
    this.overlay.append(label);
    const target = new THREE.Vector3(u.x, u.layer === 'air' ? 0.4 : 0, u.z);
    group.position.copy(target);
    this.scene.add(group);
    return {
      group,
      model,
      ring,
      label,
      target,
      data: u,
      heading: u.side === 1 ? Math.PI : 0,
      flash,
      flashUntil: 0,
    };
  }
  update(units: SceneUnit[], selected: string | null): void {
    const ids = new Set(units.map((u) => u.id));
    for (const [id, v] of this.views)
      if (!ids.has(id)) {
        this.scene.remove(v.group);
        v.label.remove();
        this.views.delete(id);
      }
    for (const u of units) {
      this.defIds.set(u.id, u.defId);
      let v = this.views.get(u.id);
      if (!v) {
        v = this.model(u);
        this.views.set(u.id, v);
        this.pulse(u.id);
      }
      const previousStar = v.data.star;
      if (previousStar < u.star) this.effects.upgrade(v.target.clone(), u.defId, u.star);
      this.resources.setStar(v.model, u.star);
      v.data = u;
      v.target.set(u.x, u.layer === 'air' ? 0.4 : 0, u.z);
      v.ring.visible = u.id === selected;
      v.label.querySelector('span')!.textContent = '★'.repeat(u.star);
      v.label.title = UNIT_BY_ID[u.defId].name;
      v.label.dataset.side = String(u.side);
      v.label.dataset.seat = String(u.seat ?? 0);
      const bar = v.label.querySelector('i')!;
      bar.hidden = u.hp === undefined;
      v.label.querySelector('b')!.style.width =
        `${u.maxHp ? (Math.max(0, u.hp ?? 0) / u.maxHp) * 100 : 100}%`;
    }
  }
  combatFrame(frame: ReplayFrame): void {
    if (this.combatId && this.combatId !== frame.battleId) this.clearCombat();
    this.combatId = frame.battleId;
    this.combatTick = frame.tick;
    this.combatTime = performance.now();
    for (const unit of frame.units) this.defIds.set(unit.id, unit.defId);
    for (const action of frame.actions) this.defIds.set(action.sourceId, action.defId);
    for (const burst of frame.deathBursts) this.defIds.set(burst.sourceId, burst.defId);
    this.effects.sync(frame.units, frame.actions, frame.deathBursts, frame.tick, (id) =>
      this.views.get(id)?.target.clone(),
    );
  }
  clearCombat(): void {
    this.effects.clear();
    this.defIds.clear();
    this.combatTick = 0;
    this.combatId = '';
  }
  pulse(id: string): void {
    this.pulses.set(id, performance.now() + 220);
  }
  setSelection(id: string | null): void {
    for (const v of this.views.values()) v.ring.visible = v.data.id === id;
  }
  setSafeArea(safe: SafeArea): void {
    this.safe = safe;
    if (!this.resizeLocked) this.resize();
  }
  lockCamera(lock: boolean): void {
    this.resizeLocked = lock;
    if (!lock) this.resize();
  }
  setViewedSide(side: 0 | 1): void {
    if (this.viewedSide === side) return;
    this.viewedSide = side;
    if (!this.resizeLocked) this.resize();
  }
  setPreview(id: string | null, x = 0, y = 0): void {
    if (!id) {
      this.preview = null;
      this.origin.visible = this.destination.visible = false;
      return;
    }
    const view = this.views.get(id);
    if (!view) return;
    const point = this.groundPoint(x, y);
    if (!point) return;
    point.y = 0.5;
    this.preview = { id, point };
    this.origin.position.set(view.target.x, 0.2, view.target.z);
    this.origin.visible = true;
  }
  highlight(pick: Pick | null, valid: boolean): void {
    if (!pick) {
      this.destination.visible = false;
      return;
    }
    const view = pick.unitId ? this.views.get(pick.unitId) : undefined;
    const world = view
      ? { x: view.target.x, z: view.target.z }
      : pick.position
        ? positionToWorld(pick.position, pick.seat)
        : null;
    if (!world) {
      this.destination.visible = false;
      return;
    }
    this.destination.visible = true;
    this.destination.position.set(world.x, 0.21, world.z);
    (this.destination.material as THREE.MeshBasicMaterial).color.setHex(
      valid ? 0x7fffd1 : 0xf46d58,
    );
  }
  project(x: number, y: number, z: number): { x: number; y: number } {
    const p = new THREE.Vector3(x, y, z).project(this.camera);
    return { x: (p.x * 0.5 + 0.5) * this.bounds.width, y: (-0.5 * p.y + 0.5) * this.bounds.height };
  }
  private groundPoint(x: number, y: number): THREE.Vector3 | null {
    this.ray(x, y);
    return this.raycaster.ray.intersectPlane(
      new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.25),
      new THREE.Vector3(),
    );
  }
  private ray(x: number, y: number): void {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(((x - r.left) / r.width) * 2 - 1, (-(y - r.top) / r.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }
  pick(x: number, y: number, ignoreId?: string, touch = false): Pick | null {
    this.ray(x, y);
    const objects: THREE.Object3D[] = [...this.views.values()]
      .filter((v) => v.data.id !== ignoreId)
      .map((v) => v.group);
    objects.push(...this.cells);
    const hits = this.raycaster.intersectObjects(objects, true);
    let result: Pick | null = null;
    for (const hit of hits) {
      if (hit.instanceId !== undefined && hit.object.userData.picks) {
        result = hit.object.userData.picks[hit.instanceId];
        break;
      }
      let o: THREE.Object3D | null = hit.object;
      while (o) {
        if (o.userData.pick) {
          result = o.userData.pick;
          break;
        }
        o = o.parent;
      }
      if (result) break;
    }
    // Occupied tiles are targets even when the pointer misses the small model mesh.
    if (result?.position) {
      const world = positionToWorld(result.position, result.seat);
      const occupied = [...this.views.values()].find(
        (v) =>
          v.data.id !== ignoreId &&
          Math.abs(v.target.x - world.x) < 0.01 &&
          Math.abs(v.target.z - world.z) < 0.01,
      );
      if (occupied) result = { ...result, unitId: occupied.data.id };
    }
    if (touch && !result?.unitId) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      let nearest = 18;
      for (const v of this.views.values()) {
        if (v.data.id === ignoreId) continue;
        const p = this.project(v.target.x, 0.4, v.target.z),
          distance = Math.hypot(x - rect.left - p.x, y - rect.top - p.y);
        if (distance < nearest) {
          nearest = distance;
          result = { unitId: v.data.id };
        }
      }
    }
    return result;
  }
  events(events: BattleEvent[]): void {
    const now = performance.now();
    for (const event of events) {
      const source = this.views.get(event.source),
        target = this.views.get(event.target ?? '');
      if ((event.kind === 'actionStart' || event.kind === 'actionRelease') && source) {
        this.pulse(source.data.id);
        if (target)
          source.heading = Math.atan2(
            source.target.x - target.target.x,
            source.target.z - target.target.z,
          );
      }
      if ((event.kind === 'damage' || event.kind === 'heal') && target && event.value) {
        if (this.transients.length < 48) {
          const node = document.createElement('div');
          node.className = `combat-number ${event.kind}`;
          node.textContent = `${event.kind === 'heal' ? '+' : '−'}${event.value}`;
          this.overlay.append(node);
          this.transients.push({
            node,
            point: target.target.clone().add(new THREE.Vector3(0, 1.2, 0)),
            born: now,
            until: now + 650,
          });
        }
        this.pulse(target.data.id);
        if (event.kind === 'damage') target.flashUntil = now + 140;
      }
      if (event.kind === 'statusApply' && target) this.pulse(target.data.id);
    }
    this.effects.events(events, (id) => this.views.get(id)?.data.defId ?? this.defIds.get(id));
  }
  private resize(): void {
    const width = this.container.clientWidth,
      height = this.container.clientHeight;
    if (!width || !height) return;
    this.bounds = { width, height };
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    const sw = Math.max(100, width - this.safe.left - this.safe.right),
      sh = Math.max(100, height - this.safe.top - this.safe.bottom),
      safeAspect = sw / sh,
      distance = Math.max(15.5, safeAspect < 1.45 ? 23 / safeAspect : 17.5),
      verticalPressure = Math.abs(this.safe.bottom - this.safe.top) / Math.max(1, height),
      framedDistance = distance + verticalPressure * 2.5;
    this.camera.aspect = width / height;
    const facing = this.viewedSide ? -1 : 1;
    // Keep the optical axis exactly on the board centre. HUD insets may zoom the view,
    // but must never yaw/roll the battlefield or make one side appear larger.
    this.camera.position.set(0, framedDistance * 0.67, framedDistance * 0.78 * facing);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }
  private draw(time: number): void {
    const dt = Math.min(50, time - this.last);
    this.last = time;
    for (const v of this.views.values()) {
      if (this.preview?.id === v.data.id) v.group.position.copy(this.preview.point);
      else v.group.position.lerp(v.target, Math.min(1, dt / 80));
      const remaining = (this.pulses.get(v.data.id) ?? 0) - time,
        playhead = this.combatTick + (time - this.combatTime) / 50,
        action = v.data.action;
      let actionScale = 1,
        actionShift = 0,
        actionTilt = 0;
      if (action && playhead >= action.startedAt && playhead <= action.recoverAt) {
        if (playhead < action.releaseAt) {
          const p =
            (playhead - action.startedAt) / Math.max(1, action.releaseAt - action.startedAt);
          actionScale = 1 - Math.sin(p * Math.PI * 0.5) * 0.1;
          actionShift = Math.sin(p * Math.PI * 0.5) * 0.1;
          actionTilt = -Math.sin(p * Math.PI) * 0.15;
        } else {
          const p =
            (playhead - action.releaseAt) / Math.max(1, action.recoverAt - action.releaseAt);
          actionScale = 1 + Math.sin(Math.min(1, p) * Math.PI) * 0.12;
          actionShift = -Math.sin(Math.min(1, p) * Math.PI) * 0.22;
          actionTilt = Math.sin(Math.min(1, p) * Math.PI) * 0.12;
        }
      }
      const pulseScale = remaining > 0 ? 1 + Math.sin((remaining / 220) * Math.PI) * 0.12 : 1;
      v.model.scale.set(
        actionScale * pulseScale,
        (2 - actionScale) * pulseScale,
        actionScale * pulseScale,
      );
      v.model.position.set(
        -Math.sin(v.heading) * actionShift,
        0.12,
        -Math.cos(v.heading) * actionShift,
      );
      v.model.rotation.x = actionTilt;
      animateUnitModel(v.model, time, action, playhead);
      if (remaining <= 0) this.pulses.delete(v.data.id);
      v.flash.visible = v.flashUntil > time;
      v.group.rotation.y = v.heading;
      const point = this.project(v.group.position.x, v.group.position.y + 1.3, v.group.position.z);
      v.label.style.transform = `translate(-50%,-100%) translate(${point.x}px,${point.y}px)`;
    }
    this.effects.draw(time);
    for (let i = this.transients.length - 1; i >= 0; i--) {
      const fx = this.transients[i];
      if (time >= fx.until) {
        fx.node.remove();
        this.transients.splice(i, 1);
        continue;
      }
      const p = this.project(fx.point.x, fx.point.y, fx.point.z);
      fx.node.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y - (time - fx.born) / 18}px)`;
      fx.node.style.opacity = String(Math.min(1, (fx.until - time) / 250));
    }
    this.annotations.forEach((node, i) => {
      const p = this.project((i - 1) * 3.1, 0, 7.5);
      node.style.transform = `translate(-50%,-50%) translate(${p.x}px,${p.y}px)`;
    });
    if (!document.hidden) this.composer.render();
    this.animation = requestAnimationFrame((t) => this.draw(t));
  }
  dispose(): void {
    cancelAnimationFrame(this.animation);
    this.observer.disconnect();
    this.scene.traverse((o) => {
      if (o instanceof THREE.InstancedMesh) o.dispose();
    });
    (this.origin.material as THREE.Material).dispose();
    (this.destination.material as THREE.Material).dispose();
    this.flashMaterial.dispose();
    this.effects.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.overlay.remove();
  }
}
