import * as THREE from 'three';
import { UNIT_BY_ID } from '../../content';
import { GameResources } from '../resources';
import { UNIT_ART } from './registry';
import { sampleClip } from './core/model';

/** Dev-only contact sheet: equal scale, fixed light, and 80px silhouette checks. */
export class ArtReviewSheet {
  private resources = new GameResources();
  private renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });

  constructor(root: HTMLElement) {
    const query = new URLSearchParams(location.search);
    const ids = (query.get('art-review') ?? '').split(',').filter((id) => UNIT_ART[id]);
    const yaw = Number(query.get('yaw') ?? 2.65);
    const audit = query.get('audit') === '1';
    const phase = Math.max(0, Math.min(1, Number(query.get('phase') ?? 0.5)));
    const mode =
      query.get('mode') === 'skill'
        ? 'skill'
        : query.get('mode') === 'attack'
          ? 'attack'
          : undefined;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(1);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x182230);
    scene.add(new THREE.HemisphereLight(0xf0f6ff, 0x27313e, 2.2));
    const key = new THREE.DirectionalLight(0xffe2bb, 2.7);
    key.position.set(-4, 7, -4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8ecfff, 1.2);
    rim.position.set(4, 3, 5);
    scene.add(rim);
    const camera = new THREE.OrthographicCamera(-1.35, 1.35, 1.255, -1.255, 0.1, 20);
    camera.position.set(0, 2.6, 6);
    camera.lookAt(0, 0.97, 0);
    root.className = `art-review${audit ? ' audit' : ''}`;
    root.innerHTML = `<style>
      #app.art-review{display:block;position:relative;overflow:auto;height:100vh;padding:20px;background:#101722;color:#ecdfc6;font:14px system-ui}
      .art-review h1{font-size:20px;margin:0 0 12px}.review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .review-card{position:relative;background:#182230;border:1px solid #354154;border-radius:10px;overflow:hidden}
      .review-card h2{font-size:16px;margin:12px 16px 0}.review-card p{margin:3px 16px;color:#a6b5c7;font-size:12px}
      .review-large{display:block;width:100%;height:320px;object-fit:contain}.review-small{position:absolute;right:10px;bottom:10px;width:80px;height:80px;border:1px solid #617083;background:#dae1e9}
      .audit .review-large{height:250px}.audit .review-small{bottom:116px;width:64px;height:64px}
      .review-angles{display:flex;height:104px;border-top:1px solid #354154}.review-angles figure{margin:0;flex:1;min-width:0;text-align:center;font-size:11px;color:#a6b5c7}.review-angles img{display:block;width:100%;height:83px;object-fit:contain}
    </style><h1>棋子辨识度验收 · 同比例 / ${mode ?? '静态'} / yaw ${yaw}</h1><div class="review-grid"></div>`;
    for (const id of ids) {
      const model = this.resources.unit(id, 0, 0, query.get('star') === '3' ? 3 : 1);
      model.rotation.y = yaw;
      if (mode && UNIT_ART[id].clips?.[mode]) sampleClip(model, UNIT_ART[id].clips[mode]!, phase);
      scene.add(model);
      this.renderer.setSize(400, 372);
      this.renderer.render(scene, camera);
      const large = this.renderer.domElement.toDataURL('image/png');
      const silhouette = new THREE.MeshBasicMaterial({ color: 0x263444 });
      scene.overrideMaterial = silhouette;
      scene.background = new THREE.Color(0xdae1e9);
      this.renderer.setSize(80, 80);
      this.renderer.render(scene, camera);
      const small = this.renderer.domElement.toDataURL('image/png');
      scene.overrideMaterial = null;
      scene.background = new THREE.Color(0x182230);
      silhouette.dispose();
      const card = document.createElement('section');
      card.className = 'review-card';
      const title = document.createElement('h2');
      title.textContent = `${UNIT_BY_ID[id].name} · ${id}`;
      const subtitle = document.createElement('p');
      subtitle.textContent = '右下：80 × 80 px 纯剪影（不以换色区分）';
      const mainImage = new Image();
      mainImage.className = 'review-large';
      mainImage.src = large;
      const smallImage = new Image();
      smallImage.className = 'review-small';
      smallImage.src = small;
      card.append(title, subtitle, mainImage, smallImage);
      if (audit) {
        const strip = document.createElement('div');
        strip.className = 'review-angles';
        for (const [label, angle, clip] of [
          ['背面', -0.65, undefined],
          ['侧面', 1.57, undefined],
          ['普攻 56%', yaw, 'attack'],
          ['技能 60%', yaw, 'skill'],
        ] as const) {
          for (const [name, base] of model.userData.baseParts) {
            const part = model.userData.parts.get(name)!;
            part.position.copy(base.position);
            part.rotation.copy(base.rotation);
            part.scale.copy(base.scale);
          }
          model.rotation.y = angle;
          if (clip && UNIT_ART[id].clips?.[clip])
            sampleClip(model, UNIT_ART[id].clips[clip]!, clip === 'skill' ? 0.6 : 0.56);
          this.renderer.setSize(160, 149);
          this.renderer.render(scene, camera);
          const figure = document.createElement('figure');
          const frame = new Image();
          frame.src = this.renderer.domElement.toDataURL('image/png');
          const caption = document.createElement('figcaption');
          caption.textContent = label;
          figure.append(frame, caption);
          strip.append(figure);
        }
        card.append(strip);
      }
      root.querySelector('.review-grid')!.append(card);
      scene.remove(model);
    }
    root.dataset.ready = 'true';
  }

  dispose(): void {
    this.resources.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
