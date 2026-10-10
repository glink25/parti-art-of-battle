import * as THREE from 'three';
import { UNITS, UNIT_BY_ID } from '../../../content';
import { GameResources } from '../../resources';
import { UNIT_ART } from '../registry';
import { animateUnitModel } from '../core/model';
import { SelectiveBloom } from '../core/bloom';
import { EffectLibrary, modelAnchor } from './runtime';
import { stableSeed } from './types';
import type { CombatAction } from '../../../domain/types';

/** Fixed-time contact sheet. Uses production models, materials and effect implementation. */
export class EffectReview {
  private resources = new GameResources();
  private library = new EffectLibrary();
  private renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  private composer: SelectiveBloom;
  constructor(root: HTMLElement) {
    const query = new URLSearchParams(location.search);
    const ids = (query.get('vfx-review') ?? '').split(',').filter((id) => UNIT_ART[id]);
    if (!ids.length) ids.push(...UNITS.slice(0, 8).map((u) => u.id));
    const seed = Number(query.get('seed') ?? 1);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x182230);
    scene.add(new THREE.HemisphereLight(0xf0f6ff, 0x27313e, 2.2));
    const key = new THREE.DirectionalLight(0xffe2bb, 2.7);
    key.position.set(-4, 7, -4);
    scene.add(key);
    const camera = new THREE.OrthographicCamera(-3.3, 3.3, 2.5, -2.5, 0.1, 50);
    camera.position.set(4, 6, -7);
    camera.lookAt(0, 0.3, -0.7);
    this.renderer.setSize(440, 330);
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.composer = new SelectiveBloom(this.renderer, scene, camera);
    this.composer.setSize(440, 330);
    const floor = new THREE.Mesh(
      this.resources.geometry(new THREE.PlaneGeometry(12, 12)),
      this.resources.artMaterial(0x283344),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.04;
    scene.add(floor);
    scene.add(new THREE.GridHelper(12, 12, 0x556174, 0x354256));
    root.innerHTML = `<style>#app{display:block!important;overflow:auto!important;background:#101722;color:#e3eaf3;padding:16px;font:13px system-ui;height:100vh}.vfx-row{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:12px}.vfx-row img{width:100%;display:block}.vfx-row figure{margin:0;background:#182230}.vfx-row figcaption{padding:5px}h2{font-size:15px;margin:8px 0}</style><h1 style="font-size:19px">程序化折面特效 · 棋盘尺度 / seed ${seed}</h1>`;
    for (const id of ids) {
      const def = UNIT_BY_ID[id],
        art = UNIT_ART[id];
      const extent = Math.max(3.3, def.skill.radius + 1.2);
      camera.left = -extent;
      camera.right = extent;
      camera.top = extent * 0.75;
      camera.bottom = -extent * 0.75;
      camera.updateProjectionMatrix();
      const title = document.createElement('h2');
      title.textContent = `${def.name} · ${def.cost}费 · ${art.skill.signature}`;
      root.append(title);
      const row = document.createElement('div');
      row.className = 'vfx-row';
      root.append(row);
      const model = this.resources.unit(id);
      scene.add(model);
      const enemy = this.resources.unit(
        'shield_slave',
        ['heal', 'shield'].includes(def.skill.kind) ? 0 : 1,
      );
      enemy.position.set(0, 0, -2.2);
      enemy.rotation.y = Math.PI;
      scene.add(enemy);
      const samples: [string, 'attack' | 'skill', string][] = [
        ['普攻命中', 'attack', 'hit'],
        ['技能蓄势', 'skill', 'charge'],
        ['技能释放', 'skill', 'flight'],
        ['技能命中', 'skill', 'hit'],
        ['技能余韵', 'skill', 'fade'],
      ];
      if (query.get('mode') === 'attack') {
        samples.splice(
          0,
          samples.length,
          ['普攻蓄势', 'attack', 'charge'],
          ['普攻释放', 'attack', 'flight'],
          ['普攻命中', 'attack', 'hit'],
          ['普攻余韵', 'attack', 'fade'],
        );
        row.style.gridTemplateColumns = 'repeat(4,1fr)';
      }
      for (const [label, kind, phase] of samples) {
        const recipe = art[kind],
          t = kind === 'attack' ? def.attackTiming : def.skill.timing;
        const timing = {
          start: 0,
          release: t.windupTicks,
          impact: t.windupTicks + t.travelTicks,
          end: t.windupTicks + t.travelTicks + Math.max(t.recoveryTicks, recipe.linger),
        };
        const at =
          phase === 'charge'
            ? timing.release * 0.65
            : phase === 'flight'
              ? timing.release + (timing.impact - timing.release) * 0.5
              : timing.impact + (timing.end - timing.impact) * (phase === 'hit' ? 0.16 : 0.72);
        const action: CombatAction = {
          id: 1,
          kind,
          targetX: 0,
          targetY: -2.2,
          startedAt: 0,
          releaseAt: timing.release,
          impactAt: timing.impact,
          recoverAt: timing.impact + t.recoveryTicks,
          released: at >= timing.release,
          power: 0,
          physical: kind === 'attack',
          critical: false,
        };
        animateUnitModel(model, at * 50, action, at);
        const effect = this.library.acquire(recipe, art, stableSeed(`${id}:${seed}`));
        scene.add(effect.group);
        const self =
          kind === 'skill' && ['buff', 'shield', 'transform', 'summon'].includes(def.skill.kind);
        effect.sample(
          at,
          timing,
          modelAnchor(model, kind),
          new THREE.Vector3(0, 0.3, self ? 0 : -2.2),
          kind === 'skill' && !self ? def.skill.radius : 0.65,
        );
        if (kind === 'attack' && def.noAttack) effect.group.visible = false;
        this.composer.render();
        const figure = document.createElement('figure'),
          image = new Image(),
          caption = document.createElement('figcaption');
        image.src = this.renderer.domElement.toDataURL('image/png');
        caption.textContent =
          kind === 'attack' && def.noAttack ? '无普攻' : `${label} · t=${at.toFixed(1)}`;
        figure.append(image, caption);
        row.append(figure);
        this.library.release(effect);
      }
      scene.remove(model, enemy);
    }
  }
  dispose(): void {
    this.composer.dispose();
    this.library.dispose();
    this.resources.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
