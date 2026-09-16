import './playground.css';
import * as THREE from 'three';
import { UNITS, UNIT_BY_ID } from '../../content';
import type { CombatAction } from '../../domain/types';
import { GameResources } from '../resources';
import { animateUnitModel } from './core/model';
import type { UnitModel } from './core/types';
import { enableEffectBloom, SelectiveBloom } from './core/bloom';
import { PreviewEffect } from './preview-effects';
import { UNIT_ART } from './registry';

type PreviewMode = 'model' | 'idle' | 'attack' | 'skill';
type InspectView = 'scene' | 'model' | 'params' | 'particles';
const FRAME_PHASES = [0, 0.18, 0.34, 0.52, 0.7, 0.84, 1];
const FRAME_LABELS = ['起始', '起手', '释放', '飞行', '命中', '消散', '结束'];

export class ArtPlayground {
  private resources = new GameResources();
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  private renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  private composer = new SelectiveBloom(this.renderer, this.scene, this.camera);
  private stage = new THREE.Group();
  private model!: UnitModel;
  private effect?: PreviewEffect;
  private observer: ResizeObserver;
  private animation = 0;
  private last = performance.now();
  private phase = 0;
  private playing = true;
  private speed = 0.35;
  private yaw = -0.42;
  private pitch = 0.04;
  private distance = 5.6;
  private targetY = 0.75;
  private dragging = false;
  private pointer = { x: 0, y: 0 };
  private unitId: string;
  private mode: PreviewMode;
  private star: number;
  private stripPending = false;
  private inspect: InspectView;
  private floor!: THREE.Mesh;
  private grid!: THREE.GridHelper;

  constructor(private root: HTMLElement) {
    const query = new URLSearchParams(location.search);
    this.unitId = UNIT_ART[query.get('unit') ?? ''] ? query.get('unit')! : 'titan';
    this.mode = this.readMode(query.get('mode'));
    this.star = THREE.MathUtils.clamp(Number(query.get('star')) || 1, 1, 3);
    this.phase = THREE.MathUtils.clamp(Number(query.get('phase')) || 0, 0, 1);
    this.playing = query.get('paused') !== '1';
    this.yaw = Number.isFinite(Number(query.get('yaw'))) ? Number(query.get('yaw')) : -0.42;
    this.pitch = Number.isFinite(Number(query.get('pitch'))) ? Number(query.get('pitch')) : 0.04;
    this.inspect = this.readInspect(query.get('inspect'));
    this.mount();
    this.scene.background = new THREE.Color(0x111723);
    this.scene.fog = new THREE.Fog(0x111723, 7, 15);
    this.scene.add(this.stage);
    this.scene.add(new THREE.HemisphereLight(0xf0f6ff, 0x20283a, 2.25));
    const key = new THREE.DirectionalLight(0xffe2bb, 2.7);
    key.position.set(-4, 7, 4);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8ecfff, 1.2);
    rim.position.set(4, 3, -5);
    this.scene.add(rim);
    this.floor = new THREE.Mesh(
      this.resources.geometry(new THREE.CylinderGeometry(2.5, 2.8, 0.16, 48)),
      this.resources.artMaterial(0x263247),
    );
    this.floor.position.y = -0.08;
    this.scene.add(this.floor);
    this.grid = new THREE.GridHelper(5, 10, 0x53657c, 0x303c50);
    this.grid.position.y = 0.015;
    this.scene.add(this.grid);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    this.renderer.domElement.className = 'art-canvas';
    this.root.querySelector('.art-viewport')!.prepend(this.renderer.domElement);
    this.camera.position.set(0, 2.1, this.distance);
    this.camera.lookAt(0, 0.75, 0);
    this.rebuild();
    this.bind();
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this.root.querySelector('.art-viewport')!);
    this.resize();
    this.animation = requestAnimationFrame((time) => this.draw(time));
    this.scheduleStrip();
    if (query.get('download') === '1')
      requestAnimationFrame(() => this.exportPng(this.inspect === 'scene' ? 'model' : this.inspect));
  }

  private readMode(value: string | null): PreviewMode {
    return value === 'idle' || value === 'attack' || value === 'skill' ? value : 'model';
  }

  private readInspect(value: string | null): InspectView {
    return value === 'model' || value === 'params' || value === 'particles' ? value : 'scene';
  }

  private mount(): void {
    this.root.className = 'art-playground';
    this.root.innerHTML = `
      <header class="art-header">
        <div><strong>程序化棋子验收台</strong><small>ART PLAYGROUND · DEV ONLY</small></div>
        <label>棋子<select data-control="unit">${UNITS.map((unit) => `<option value="${unit.id}">${unit.name} · ${unit.id}</option>`).join('')}</select></label>
        <label>模式<select data-control="mode"><option value="model">模型观察</option><option value="idle">待机</option><option value="attack">普攻</option><option value="skill">技能</option></select></label>
        <label>星级<select data-control="star"><option value="1">一星</option><option value="2">二星</option><option value="3">三星</option></select></label>
        <button data-action="copy">复制预览链接</button><button data-action="capture">导出当前 PNG</button>
      </header>
      <main class="art-main">
        <section class="art-viewport">
          <div class="art-help">拖动旋转 · 滚轮缩放</div>
          <div class="art-angles"><button data-angle="0">正面</button><button data-angle="-0.78">斜面</button><button data-angle="-1.57">侧面</button><button data-angle="3.14">背面</button></div>
        </section>
        <aside class="art-info"><h1></h1><p class="art-id"></p><dl></dl><p class="art-skill"></p><p class="art-description"></p><nav class="art-export-links"><b>AI 图片检视</b><a data-inspect-link="model">打开模型净视图</a><a data-inspect-link="params">打开参数图</a><a data-inspect-link="particles">打开粒子净视图</a><button data-export="model">下载模型 PNG</button><button data-export="params">下载参数 PNG</button><button data-export="particles">下载粒子 PNG</button></nav><div class="art-parts"></div></aside>
        <pre class="art-parameter-sheet" hidden></pre>
      </main>
      <footer class="art-timeline">
        <div class="art-transport"><button data-action="play">暂停</button><label>速度<select data-control="speed"><option value="0.18">0.5×</option><option value="0.35" selected>1×</option><option value="0.7">2×</option></select></label><input data-control="phase" type="range" min="0" max="1" step="0.001" value="0"><output>0%</output></div>
        <div class="art-filmstrip">${FRAME_PHASES.map((phase, index) => `<figure data-frame="${phase}"><img alt="${FRAME_LABELS[index]}"><figcaption>${FRAME_LABELS[index]} · ${Math.round(phase * 100)}%</figcaption></figure>`).join('')}</div>
      </footer>`;
    (this.root.querySelector('[data-control="unit"]') as HTMLSelectElement).value = this.unitId;
    (this.root.querySelector('[data-control="mode"]') as HTMLSelectElement).value = this.mode;
    (this.root.querySelector('[data-control="star"]') as HTMLSelectElement).value = String(
      this.star,
    );
  }

  private rebuild(): void {
    if (this.model) this.stage.remove(this.model);
    this.effect?.dispose();
    if (this.effect) this.scene.remove(this.effect.group);
    this.model = this.resources.unit(this.unitId, 0, 0, this.star);
    this.stage.add(this.model);
    this.frameModel();
    if (this.mode === 'attack' || this.mode === 'skill') {
      this.effect = new PreviewEffect(this.resources, UNIT_ART[this.unitId], this.mode);
      enableEffectBloom(this.effect.group);
      this.scene.add(this.effect.group);
    } else this.effect = undefined;
    this.updateInfo();
    this.applyInspectView();
    this.updateUrl();
    this.scheduleStrip();
  }

  private frameModel(): void {
    this.stage.rotation.set(0, this.yaw, 0);
    this.stage.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(this.model),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3());
    this.targetY = THREE.MathUtils.clamp(center.y, 0.65, 1.3);
    this.distance = THREE.MathUtils.clamp(Math.max(4.8, size.x * 2.2, size.y * 2.15, size.z * 2), 4.8, 9);
    this.camera.position.set(0, this.targetY + 1.35, this.distance);
    this.camera.lookAt(0, this.targetY, 0);
  }

  private updateInfo(): void {
    const unit = UNIT_BY_ID[this.unitId],
      art = UNIT_ART[this.unitId];
    this.root.querySelector('.art-info h1')!.textContent = unit.name;
    this.root.querySelector('.art-id')!.textContent = `${unit.id} · ${art.signature}`;
    this.root.querySelector('.art-info dl')!.innerHTML =
      `<dt>费用</dt><dd>${unit.cost}</dd><dt>羁绊</dt><dd>${unit.tags.join(' / ')}</dd><dt>射程</dt><dd>${unit.range}</dd><dt>层级</dt><dd>${unit.layer}</dd>`;
    this.root.querySelector('.art-skill')!.textContent = `技能 · ${unit.skill.name}`;
    this.root.querySelector('.art-description')!.textContent = unit.skill.description;
    this.root.querySelector('.art-parts')!.innerHTML =
      `<b>${art.parts.length} 个独立部件</b>${art.parts.map((part) => `<span>${part.name}${part.parent ? ` ← ${part.parent}` : ''}</span>`).join('')}`;
    this.root.querySelector('.art-parameter-sheet')!.textContent = this.parameterText();
    this.updateInspectLinks();
  }

  private parameterText(): string {
    const art = UNIT_ART[this.unitId];
    const rows = art.parts.map(
      (part) =>
        `${part.name.padEnd(18)} ${part.primitive.padEnd(10)} parent=${(part.parent ?? '-').padEnd(16)} ` +
        `pos=[${part.position.join(', ')}] scale=[${part.scale.join(', ')}] rot=[${(part.rotation ?? [0, 0, 0]).map((value) => value.toFixed(2)).join(', ')}]`,
    );
    return [
      `${this.unitId} / ${art.signature}`,
      `palette ${Object.entries(art.palette).map(([key, value]) => `${key}=#${value.toString(16).padStart(6, '0')}`).join('  ')}`,
      `motion ${JSON.stringify(art.motion)}`,
      `attack ${JSON.stringify(art.attack)}`,
      `skill  ${JSON.stringify(art.skill)}`,
      `anchors ${JSON.stringify(art.anchors ?? {})}`,
      '',
      ...rows,
    ].join('\n');
  }

  private inspectUrl(view: Exclude<InspectView, 'scene'>, download = false): string {
    const query = new URLSearchParams(location.search);
    query.set('art-playground', '1');
    query.set('unit', this.unitId);
    query.set('inspect', view);
    query.set('paused', '1');
    query.set('yaw', this.yaw.toFixed(3));
    query.set('pitch', this.pitch.toFixed(3));
    if (view === 'particles') {
      query.set('mode', this.mode === 'attack' ? 'attack' : 'skill');
      query.set('phase', '0.700');
    } else {
      query.set('mode', 'model');
      query.set('phase', '0');
    }
    if (download) query.set('download', '1');
    else query.delete('download');
    return `${location.origin}${location.pathname}?${query}${location.hash}`;
  }

  private updateInspectLinks(): void {
    this.root.querySelectorAll<HTMLAnchorElement>('[data-inspect-link]').forEach((link) => {
      const view = link.dataset.inspectLink as Exclude<InspectView, 'scene'>;
      link.href = this.inspectUrl(view);
      link.target = '_blank';
      link.rel = 'noopener';
    });
  }

  private applyInspectView(): void {
    const parameterSheet = this.root.querySelector<HTMLElement>('.art-parameter-sheet')!;
    const focused = this.inspect !== 'scene';
    this.root.classList.toggle('is-inspection', focused);
    this.root.classList.toggle('is-parameter-view', this.inspect === 'params');
    parameterSheet.hidden = this.inspect !== 'params';
    this.model.visible = this.inspect !== 'particles' && this.inspect !== 'params';
    if (this.effect) this.effect.group.visible = this.inspect !== 'model' && this.inspect !== 'params';
    this.floor.visible = this.inspect !== 'params';
    this.grid.visible = this.inspect === 'scene';
  }

  private action(): CombatAction | null {
    if (this.mode !== 'attack' && this.mode !== 'skill') return null;
    return {
      id: 1,
      kind: this.mode,
      targetX: 0,
      targetY: 0,
      startedAt: 0,
      releaseAt: 32,
      impactAt: 70,
      recoverAt: 100,
      released: this.phase >= 0.32,
      power: 1,
      physical: this.mode === 'attack',
      critical: false,
    };
  }

  private renderAt(phase: number, time: number, yaw = this.yaw): void {
    this.model.position.set(0, 0, 0);
    this.model.scale.setScalar(1);
    this.model.rotation.set(0, 0, 0);
    this.stage.rotation.set(this.pitch, yaw, 0);
    if (this.mode !== 'model') animateUnitModel(this.model, time, this.action(), phase * 100);
    this.effect?.sample(phase);
    this.applyInspectView();
    this.composer.render();
  }

  private draw(time: number): void {
    const dt = Math.min(100, time - this.last);
    this.last = time;
    if (this.playing && this.mode !== 'model')
      this.phase = (this.phase + dt * 0.001 * this.speed) % 1;
    this.renderAt(this.phase, time);
    const slider = this.root.querySelector('[data-control="phase"]') as HTMLInputElement;
    slider.value = String(this.phase);
    this.root.querySelector('output')!.textContent = `${Math.round(this.phase * 100)}%`;
    this.animation = requestAnimationFrame((next) => this.draw(next));
  }

  private bind(): void {
    this.root.addEventListener('change', (event) => {
      const target = event.target as HTMLSelectElement;
      const control = target.dataset.control;
      if (control === 'unit') {
        this.unitId = target.value;
        this.rebuild();
      }
      if (control === 'mode') {
        this.mode = this.readMode(target.value);
        this.phase = 0;
        this.rebuild();
      }
      if (control === 'star') {
        this.star = Number(target.value);
        this.rebuild();
      }
      if (control === 'speed') this.speed = Number(target.value);
    });
    this.root.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.dataset.control === 'phase') {
        this.phase = Number(target.value);
        this.playing = false;
        this.syncPlayButton();
        this.updateUrl();
      }
    });
    this.root.addEventListener('click', (event) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
      if (!button) return;
      if (button.dataset.angle !== undefined) {
        this.yaw = Number(button.dataset.angle);
        this.pitch = 0.04;
        this.updateUrl();
        this.scheduleStrip();
      }
      if (button.dataset.action === 'play') {
        this.playing = !this.playing;
        this.syncPlayButton();
        this.updateUrl();
      }
      if (button.dataset.action === 'copy') void navigator.clipboard.writeText(location.href);
      if (button.dataset.action === 'capture') {
        this.exportPng(this.inspect === 'scene' ? 'model' : this.inspect);
      }
      if (button.dataset.export)
        this.exportPng(button.dataset.export as Exclude<InspectView, 'scene'>);
    });
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      this.pointer = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      this.yaw += (event.clientX - this.pointer.x) * 0.008;
      this.pitch = THREE.MathUtils.clamp(
        this.pitch + (event.clientY - this.pointer.y) * 0.005,
        -0.35,
        0.45,
      );
      this.pointer = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener('pointerup', () => {
      this.dragging = false;
      this.updateUrl();
      this.scheduleStrip();
    });
    canvas.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        this.distance = THREE.MathUtils.clamp(this.distance + event.deltaY * 0.004, 3.3, 9);
        this.camera.position.z = this.distance;
      },
      { passive: false },
    );
  }

  private exportPng(view: Exclude<InspectView, 'scene'>): void {
    let href: string;
    if (view === 'params') href = this.parameterImage();
    else {
      let temporaryEffect = false;
      if (view === 'particles' && !this.effect) {
        this.effect = new PreviewEffect(this.resources, UNIT_ART[this.unitId], 'skill');
        enableEffectBloom(this.effect.group);
        this.scene.add(this.effect.group);
        temporaryEffect = true;
      }
      const previous = this.inspect;
      this.inspect = view;
      const phase = view === 'particles' ? 0.7 : this.phase;
      this.renderAt(phase, performance.now());
      href = this.renderer.domElement.toDataURL('image/png');
      this.inspect = previous;
      if (temporaryEffect) {
        this.scene.remove(this.effect!.group);
        this.effect!.dispose();
        this.effect = undefined;
      }
      this.applyInspectView();
    }
    const link = document.createElement('a');
    link.download = `${this.unitId}-${view}.png`;
    link.href = href;
    link.click();
  }

  private parameterImage(): string {
    const canvas = document.createElement('canvas');
    canvas.width = 1800;
    canvas.height = 1200;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#111723';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#e8edf5';
    context.font = '24px ui-monospace, SFMono-Regular, Menlo, monospace';
    const lines = this.parameterText().split('\n');
    const split = 9 + Math.ceil((lines.length - 9) / 2);
    lines.forEach((line, index) => {
      const secondColumn = index >= split;
      const x = secondColumn ? 910 : 42;
      const row = secondColumn ? index - split : index;
      context.fillStyle = index < 7 ? '#a9deff' : '#d8dee9';
      context.fillText(line.slice(0, 88), x, 48 + row * 27);
    });
    return canvas.toDataURL('image/png');
  }

  private syncPlayButton(): void {
    this.root.querySelector<HTMLButtonElement>('[data-action="play"]')!.textContent = this.playing
      ? '暂停'
      : '播放';
  }

  private updateUrl(): void {
    const query = new URLSearchParams(location.search);
    query.set('art-playground', '1');
    query.set('unit', this.unitId);
    query.set('mode', this.mode);
    query.set('star', String(this.star));
    query.set('phase', this.phase.toFixed(3));
    query.set('yaw', this.yaw.toFixed(3));
    query.set('pitch', this.pitch.toFixed(3));
    if (this.playing) query.delete('paused');
    else query.set('paused', '1');
    if (this.inspect === 'scene') query.delete('inspect');
    else query.set('inspect', this.inspect);
    query.delete('download');
    history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
    this.updateInspectLinks();
  }

  private resize(): void {
    const viewport = this.root.querySelector('.art-viewport') as HTMLElement;
    const width = Math.max(1, viewport.clientWidth),
      height = Math.max(1, viewport.clientHeight);
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.scheduleStrip();
  }

  private scheduleStrip(): void {
    if (this.stripPending || !this.model) return;
    this.stripPending = true;
    requestAnimationFrame(() => {
      this.stripPending = false;
      this.refreshStrip();
    });
  }

  private refreshStrip(): void {
    const viewport = this.root.querySelector('.art-viewport') as HTMLElement;
    const width = viewport.clientWidth,
      height = viewport.clientHeight,
      saved = this.phase;
    this.renderer.setSize(280, 180, false);
    this.composer.setSize(280, 180);
    this.camera.aspect = 280 / 180;
    this.camera.updateProjectionMatrix();
    this.root.querySelectorAll<HTMLElement>('[data-frame]').forEach((frame, index) => {
      const phase = FRAME_PHASES[index];
      const angle =
        this.mode === 'model' ? [0, -0.78, -1.57, -2.35, Math.PI, 2.35, 0.78][index] : this.yaw;
      this.renderAt(phase, phase * 1600, angle);
      frame.querySelector('img')!.src = this.renderer.domElement.toDataURL('image/png');
    });
    this.phase = saved;
    this.renderer.setSize(width, height, false);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    cancelAnimationFrame(this.animation);
    this.observer.disconnect();
    this.effect?.dispose();
    this.composer.dispose();
    this.renderer.dispose();
    this.resources.dispose();
    this.root.replaceChildren();
  }
}
