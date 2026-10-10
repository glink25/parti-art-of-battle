import * as THREE from 'three';
import { CONTENT_HASH, RULES, UNIT_BY_ID } from '../../../content';
import { buildReplay } from '../../../combat/replay';
import type { BattleDescriptor, BattleUnit } from '../../../domain/types';
import { GameResources } from '../../resources';
import { CombatEffects } from '../../combat-effects';
import { animateUnitModel } from '../core/model';
import { SelectiveBloom } from '../core/bloom';
import { modelAnchor } from './runtime';
import type { UnitModel } from '../core/types';

/** Real deterministic replay through the production VFX adapter, without room services. */
export class BattleEffectReview {
  private resources = new GameResources();
  private renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  private effects: CombatEffects;
  private composer: SelectiveBloom;
  constructor(root: HTMLElement) {
    const q = new URLSearchParams(location.search),
      seed = Number(q.get('seed') ?? 7),
      tick = Number(q.get('tick') ?? 48);
    const ids = [
      'whale',
      'bone_dragon',
      'tree',
      'turtle',
      'bull',
      'buddha',
      'eel',
      'ark',
      'ghost',
      'ninja_panda',
      'ukyo',
      'athena',
      'flame',
      'venom',
      'divine_tower',
      'commando',
    ];
    const sides = [0, 1].map((side) =>
      ids.map((defId, i): BattleUnit => ({
        id: `${side}:${i}`,
        defId,
        ownerId: String(side),
        star: 2,
        x: 1 + (i % 8),
        y: side ? 2 + Math.floor(i / 8) : 6 + Math.floor(i / 8),
        items: [],
      })),
    );
    const d: BattleDescriptor = {
      id: 'vfx-review',
      seed,
      round: 20,
      rulesetId: RULES.id,
      simulationVersion: RULES.simulationVersion,
      contentHash: CONTENT_HASH,
      teams: ['a', 'b'],
      mirror: false,
      neutral: false,
      sides: [sides[0], sides[1]],
    };
    const replay = buildReplay(d),
      scene = new THREE.Scene();
    scene.background = new THREE.Color(0x182230);
    const camera = new THREE.PerspectiveCamera(42, 1400 / 1050, 0.1, 100);
    camera.position.set(9, 13, 13);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xf0f6ff, 0x27313e, 2.2));
    const key = new THREE.DirectionalLight(0xffe2bb, 2.7);
    key.position.set(-4, 7, -4);
    scene.add(key);
    const floor = new THREE.Mesh(
      this.resources.geometry(new THREE.PlaneGeometry(10, 10)),
      this.resources.artMaterial(0x283344),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    scene.add(floor, new THREE.GridHelper(10, 10, 0x66778c, 0x354256));
    this.effects = new CombatEffects(scene, this.resources);
    this.renderer.setSize(1400, 1050);
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.composer = new SelectiveBloom(this.renderer, scene, camera);
    this.composer.setSize(1400, 1050);
    const models = new Map<string, UnitModel>(),
      definitions = new Map<string, string>();
    let last = replay.frames[0];
    let skills = 0;
    for (const f of replay.frames) {
      if (f.tick > tick) break;
      last = f;
      const alive = new Set(f.units.map((u) => u.id));
      for (const [id, m] of models)
        if (!alive.has(id)) {
          scene.remove(m);
          models.delete(id);
        }
      for (const u of f.units) {
        let m = models.get(u.id);
        if (!m) {
          m = this.resources.unit(u.defId, u.side, 0, u.star);
          models.set(u.id, m);
          scene.add(m);
        }
        definitions.set(u.id, u.defId);
        m.position.set(u.x - 4.5, u.layer === 'air' ? 0.4 : 0, u.y - 4.5);
        m.rotation.y = u.side ? Math.PI : 0;
        animateUnitModel(m, f.tick * 50, u.action, f.tick);
      }
      this.effects.sync(f.units, f.actions, f.deathBursts, f.tick, (id, kind) => {
        const m = models.get(id);
        return m
          ? kind
            ? modelAnchor(m, kind)
            : m.position.clone().add(new THREE.Vector3(0, 0.5, 0))
          : undefined;
      });
      this.effects.events(f.events, (id) => definitions.get(id));
      this.effects.sample(f.tick);
      skills += f.events.filter((e) => e.kind === 'actionImpact' && e.action === 'skill').length;
    }
    this.composer.render();
    root.innerHTML = `<style>#app{display:block!important;height:100vh;overflow:auto!important;background:#101722;color:#e3eaf3;font:14px system-ui;padding:16px}.vfx-board{position:relative;width:1400px;height:1050px}.vfx-label{position:absolute;width:62px;text-align:center;transform:translate(-50%,-100%);font-size:10px;text-shadow:0 1px 3px #000}.vfx-label i{display:block;height:4px;background:#15212d;border:1px solid #c4d3df}.vfx-label b{display:block;height:100%}</style><h2>实际回放混战 · 32 棋子 · tick ${last.tick} · seed ${seed} · 已结算技能 ${skills}</h2><p>健康条为当前回放状态；离屏画面不代表移动设备性能验收。</p><div class="vfx-board"></div>`;
    const board = root.querySelector('.vfx-board')!;
    const image = new Image();
    image.src = this.renderer.domElement.toDataURL('image/png');
    board.append(image);
    for (const u of last.units) {
      const p = new THREE.Vector3(
        u.x - 4.5,
        (u.layer === 'air' ? 0.4 : 0) + 1.7,
        u.y - 4.5,
      ).project(camera);
      const label = document.createElement('div');
      label.className = 'vfx-label';
      label.style.left = `${(p.x * 0.5 + 0.5) * 1400}px`;
      label.style.top = `${(-p.y * 0.5 + 0.5) * 1050}px`;
      label.innerHTML = `${UNIT_BY_ID[u.defId].name}<i><b style="width:${(u.hp / u.maxHp) * 100}%;background:${u.side ? '#ef8d78' : '#70d9b9'}"></b></i>`;
      board.append(label);
    }
  }
  dispose(): void {
    this.effects.dispose();
    this.resources.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
