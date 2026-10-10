import * as THREE from 'three';
import { createEffectAtlas } from './atlas';
import { effectSculpture } from './sculptures';
import { enableEffectBloom } from '../core/bloom';
import type { UnitArtDefinition, UnitModel } from '../core/types';
import {
  noise,
  phaseAt,
  TEXTURES,
  type EffectRecipe,
  type EffectTiming,
  type TextureMotif,
} from './types';

const CAPACITY = 64;
const SEGMENTS = 24;
const STRANDS = 6;
const clamp = THREE.MathUtils.clamp;

const scratch = new THREE.Object3D();
const color = new THREE.Color();

export function modelAnchor(model: UnitModel, kind: 'attack' | 'skill'): THREE.Vector3 {
  model.updateWorldMatrix(true, true);
  const name = model.userData.art.anchors?.[kind];
  const part = name && model.userData.parts.get(name);
  return (part || model).getWorldPosition(new THREE.Vector3());
}

/** Atlas and shader are shared. Per-instance geometry is owned by the pool. */
export class EffectLibrary {
  readonly texture: THREE.Texture;
  readonly material: THREE.ShaderMaterial;
  private pool: EffectInstance[] = [];
  private all = new Set<EffectInstance>();
  constructor(texture?: THREE.Texture) {
    this.texture = texture ?? createEffectAtlas();
    this.material = new THREE.ShaderMaterial({
      uniforms: { atlas: { value: this.texture } },
      vertexShader: `
        attribute vec4 fxMeta;
        attribute vec3 fxTint;
        attribute float fxFace;
        varying vec2 vUv;
        varying vec4 vMeta;
        varying vec3 vTint;
        void main() {
          vUv=uv; vMeta=fxMeta; vTint=fxTint;
          vec3 p=position;
          p.x += sin(uv.y*7.0+fxMeta.w)*0.065*sin(uv.y*3.14159)*step(0.01,fxMeta.w);
          #ifdef USE_INSTANCING
            if(fxFace>0.5) {
              vec4 center=modelViewMatrix*instanceMatrix*vec4(0.,0.,0.,1.);
              vec2 axis=normalize(vec2(instanceMatrix[0][0],instanceMatrix[0][1])+vec2(0.00001,0.));
              vec2 offset=vec2(p.x*length(instanceMatrix[0].xyz),p.y*length(instanceMatrix[1].xyz));
              center.xy+=mat2(axis.x,axis.y,-axis.y,axis.x)*offset;
              gl_Position=projectionMatrix*center;
            } else gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(p,1.);
          #else
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
          #endif
        }`,
      fragmentShader: `
        uniform sampler2D atlas;
        varying vec2 vUv; varying vec4 vMeta; varying vec3 vTint;
        void main(){
          float col=mod(vMeta.x,4.); float row=floor(vMeta.x/4.);
          vec2 uv=(vec2(col,3.-row)+vec2(0.015)+vUv*0.97)/4.;
          vec3 tex=texture2D(atlas,uv).rgb;
          float lum=max(tex.r,max(tex.g,tex.b));
          float border=smoothstep(0.,0.075,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
          float alpha=pow(lum,0.78)*vMeta.y*border;
          if(alpha<0.008) discard;
          gl_FragColor=vec4(vTint*(0.42+lum*0.48)*vMeta.z,alpha);
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      toneMapped: false,
    });
  }
  acquire(recipe: EffectRecipe, art: UnitArtDefinition, seed: number): EffectInstance {
    const instance = this.pool.pop() ?? new EffectInstance(this.material);
    this.all.add(instance);
    instance.configure(recipe, art, seed);
    return instance;
  }
  release(instance: EffectInstance): void {
    instance.group.removeFromParent();
    instance.group.visible = false;
    if (!this.pool.includes(instance)) this.pool.push(instance);
  }
  dispose(): void {
    for (const instance of this.all) instance.dispose();
    this.all.clear();
    this.pool.length = 0;
    this.material.dispose();
    this.texture.dispose();
  }
}

export class EffectInstance {
  readonly group = new THREE.Group();
  private mesh: THREE.InstancedMesh;
  private ribbon: THREE.Mesh;
  private solidMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.6,
    metalness: 0.18,
    flatShading: true,
    transparent: true,
  });
  private crystal = new THREE.InstancedMesh(effectSculpture('crystal'), this.solidMaterial, 16);
  private drones = new THREE.InstancedMesh(effectSculpture('drone'), this.solidMaterial, 8);
  private meta = new THREE.InstancedBufferAttribute(new Float32Array(CAPACITY * 4), 4);
  private tint = new THREE.InstancedBufferAttribute(new Float32Array(CAPACITY * 3), 3);
  private face = new THREE.InstancedBufferAttribute(new Float32Array(CAPACITY), 1);
  private ribbonPosition = new THREE.BufferAttribute(
    new Float32Array(STRANDS * (SEGMENTS + 1) * 6),
    3,
  );
  private ribbonMeta = new THREE.BufferAttribute(new Float32Array(STRANDS * (SEGMENTS + 1) * 8), 4);
  private ribbonTint = new THREE.BufferAttribute(new Float32Array(STRANDS * (SEGMENTS + 1) * 6), 3);
  recipe!: EffectRecipe;
  private art!: UnitArtDefinition;
  private seed = 1;
  private cursor = 0;
  private strand = 0;
  constructor(material: THREE.ShaderMaterial) {
    const quad = new THREE.PlaneGeometry(1, 1, 4, 4);
    quad.setAttribute('fxMeta', this.meta);
    quad.setAttribute('fxTint', this.tint);
    quad.setAttribute('fxFace', this.face);
    this.mesh = new THREE.InstancedMesh(quad, material, CAPACITY);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    const strip = new THREE.BufferGeometry(),
      uv: number[] = [],
      indices: number[] = [];
    for (let s = 0; s < STRANDS; s++) {
      for (let i = 0; i <= SEGMENTS; i++) uv.push(i / SEGMENTS, 0, i / SEGMENTS, 1);
      for (let i = 0; i < SEGMENTS; i++) {
        const a = s * (SEGMENTS + 1) * 2 + i * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    strip.setAttribute('position', this.ribbonPosition);
    strip.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    strip.setAttribute('fxMeta', this.ribbonMeta);
    strip.setAttribute('fxTint', this.ribbonTint);
    strip.setAttribute(
      'fxFace',
      new THREE.Float32BufferAttribute(new Float32Array(STRANDS * (SEGMENTS + 1) * 2), 1),
    );
    strip.setIndex(indices);
    this.ribbon = new THREE.Mesh(strip, material);
    this.ribbon.frustumCulled = false;
    this.crystal.frustumCulled = this.drones.frustumCulled = false;
    this.group.add(this.ribbon, this.mesh, this.crystal, this.drones);
    enableEffectBloom(this.group);
  }
  configure(recipe: EffectRecipe, art: UnitArtDefinition, seed: number): void {
    this.recipe = recipe;
    this.art =
      recipe.texture === 'fire' ? { ...art, palette: { ...art.palette, energy: 0xff8739 } } : art;
    this.seed = seed;
    this.group.visible = true;
  }
  private stamp(
    motif: TextureMotif,
    p: THREE.Vector3,
    w: number,
    h: number,
    opacity: number,
    angle = 0,
    ground = false,
    tint = this.art.palette.energy,
    glow = 1,
    warp = 0,
  ): void {
    if (this.cursor >= CAPACITY || opacity <= 0.005) return;
    if (this.recipe.signature.startsWith('state:')) opacity *= 0.6;
    const i = this.cursor++;
    scratch.position.copy(p);
    scratch.rotation.set(ground ? -Math.PI / 2 : 0, 0, angle);
    scratch.scale.set(Math.max(0.001, w), Math.max(0.001, h), 1);
    scratch.updateMatrix();
    this.mesh.setMatrixAt(i, scratch.matrix);
    this.meta.setXYZW(i, TEXTURES.indexOf(motif), opacity, glow, warp);
    color.setHex(tint);
    this.tint.setXYZ(i, color.r, color.g, color.b);
    this.face.setX(i, ground ? 0 : 1);
  }
  private strip(
    motif: TextureMotif,
    path: (t: number) => THREE.Vector3,
    width: number,
    alpha: number,
    upright = false,
    tint = this.art.palette.energy,
  ): void {
    if (this.strand >= STRANDS || alpha <= 0.005) return;
    if (this.recipe.signature.startsWith('state:')) alpha *= 0.4;
    const start = this.strand++ * (SEGMENTS + 1) * 2;
    color.setHex(tint);
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS,
        p = path(t),
        next = path(Math.min(1, t + 0.01)),
        prev = path(Math.max(0, t - 0.01));
      const dir = next.sub(prev).normalize();
      const side = upright
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(-dir.z, 0, dir.x).normalize();
      const taper = Math.pow(Math.sin(Math.PI * t), 0.35);
      for (let j = 0; j < 2; j++) {
        const idx = start + i * 2 + j,
          v = p.clone().addScaledVector(side, (j - 0.5) * width * taper);
        this.ribbonPosition.setXYZ(idx, v.x, v.y, v.z);
        this.ribbonMeta.setXYZW(idx, TEXTURES.indexOf(motif), alpha, 1.05, 0);
        const shade = 0.65 + (i % 3) * 0.12 + j * 0.11;
        this.ribbonTint.setXYZ(idx, color.r * shade, color.g * shade, color.b * shade);
      }
    }
  }
  sample(
    time: number,
    timing: EffectTiming,
    from: THREE.Vector3,
    to: THREE.Vector3,
    radius: number,
    detail = 1,
  ): void {
    const phase = phaseAt(time, timing),
      r = this.recipe,
      mode = r.choreography;
    this.group.visible = phase.visible;
    if (!phase.visible) return;
    this.cursor = 0;
    this.strand = 0;
    this.crystal.count = this.drones.count = 0;
    const dir = to.clone().sub(from),
      heading = Math.atan2(dir.x, dir.z),
      p = phase.flight,
      hit = phase.hit;
    const skill = radius > 0.9,
      area = Math.max(0.45, radius),
      w = r.width;
    this.solidMaterial.opacity = phase.impacted ? Math.min(1, (1 - phase.hit) * 2) : 1;
    const ground = to.clone();
    ground.y = 0.055;
    const particleCount = Math.max(3, Math.floor(r.particles * detail));
    const pos = (x: number, y: number, z: number, origin = to) =>
      origin.clone().add(new THREE.Vector3(x, y, z));
    const flight = (t: number) =>
      from
        .clone()
        .lerp(to, t)
        .add(new THREE.Vector3(0, Math.sin(t * Math.PI) * r.arc, 0));
    if (!phase.released) {
      // Small source-bound buildup: never invent a damage area at an enemy for a self buff.
      const q = phase.charge,
        s = w * (0.3 + q * 0.6);
      this.stamp(
        r.texture,
        from,
        s,
        s,
        0.18 + q * 0.36,
        q * r.turns,
        false,
        undefined,
        1.1,
        time * 0.04,
      );
      if (skill)
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + q * r.turns,
            d = (1 - q) * 0.5 + 0.15;
          this.stamp(
            r.secondary,
            pos(Math.cos(a) * d, 0.05, Math.sin(a) * d, from),
            0.18,
            0.3,
            q * 0.5,
            a,
          );
        }
    } else if (!phase.impacted) {
      const point = flight(p);
      if (['cut', 'cleave', 'sweep', 'shadow', 'snow'].includes(mode)) {
        const n = mode === 'shadow' ? 3 : mode === 'snow' ? 2 : 1;
        for (let j = 0; j < n; j++)
          this.strip(
            'slash',
            (t) => {
              const a =
                heading + (t - 0.5) * Math.PI * (mode === 'sweep' ? 1.9 : 1.1) + p * 0.8 + j * 1.8;
              return pos(
                Math.sin(a) * (0.45 + p * 0.4),
                0.05 + Math.sin(t * Math.PI) * 0.25,
                Math.cos(a) * (0.45 + p * 0.4),
                from,
              );
            },
            w * 0.8,
            0.9,
          );
      } else if (['breath', 'lightning', 'seal'].includes(mode)) {
        const n = mode === 'lightning' ? 3 : 1;
        for (let j = 0; j < n; j++)
          this.strip(
            r.texture,
            (t) => {
              const v = from.clone().lerp(to, t);
              const shake =
                mode === 'lightning'
                  ? Math.sin(t * 73 + j + Math.floor(time * 2)) * 0.12
                  : Math.sin(t * 9 - time * 0.5) * 0.08;
              v.x += shake;
              v.y += Math.sin(t * 12 + j) * 0.08;
              return v;
            },
            mode === 'breath' ? w * (0.6 + p) : 0.24,
            0.8,
            true,
          );
        if (mode === 'breath')
          for (let i = 0; i < 9; i++) {
            const t = (i / 9 + p * 0.8) % 1;
            this.stamp(
              r.texture,
              flight(t),
              w * (0.4 + t),
              w * (0.5 + t),
              Math.sin(t * Math.PI) * 0.6,
              0,
              false,
              undefined,
              1.1,
              time * 0.12 + i,
            );
          }
      } else if (mode === 'phase') {
        this.strip(r.texture, (t) => flight(p * t), w, 0.75);
        for (let i = 0; i < 4; i++)
          this.stamp(
            r.secondary,
            flight(Math.max(0, p - i * 0.13)),
            w * (1 - i * 0.15),
            w * 1.6,
            0.5 - i * 0.1,
            heading,
          );
      } else if (mode === 'wave') {
        this.strip(
          r.texture,
          (t) => {
            const v = flight(p);
            const a = (t - 0.5) * Math.PI;
            v.x += Math.cos(heading) * (t - 0.5) * area * 2;
            v.z -= Math.sin(heading) * (t - 0.5) * area * 2;
            v.y = 0.35 + Math.sin(a + Math.PI / 2) * 0.28;
            return v;
          },
          w * 1.5,
          0.88,
          true,
        );
      } else if (
        [
          'ward',
          'ascend',
          'portal',
          'bloom',
          'roots',
          'quake',
          'storm',
          'prism',
          'swallow',
          'web',
        ].includes(mode)
      ) {
        this.stamp(
          r.texture,
          point,
          w * (0.7 + p),
          w * (0.7 + p),
          0.45,
          p * r.turns,
          false,
          undefined,
          1.1,
          time * 0.05,
        );
      } else {
        const count = mode === 'salvo' || mode === 'launch' ? 3 : 1;
        for (let j = 0; j < count; j++) {
          const t = clamp(p - j * 0.08, 0, 1),
            end = flight(t);
          end.x += (j - (count - 1) / 2) * 0.13;
          this.stamp(r.texture, end, w * 0.7, w * 0.9, 0.95, -heading, false, undefined, 1.3);
          this.strip(r.texture, (u) => flight(Math.max(0, t - u * 0.25)), w * 0.28, 0.65, true);
        }
      }
      // Release flash on the actual moving weapon anchor.
      const flash = 1 - clamp(p * 4, 0, 1);
      if (['shot', 'salvo', 'shell', 'thrust'].includes(mode))
        this.stamp(r.texture, from, w, w * 0.65, flash * 0.85, 0, false, undefined, 1.4);
    } else {
      const fade = Math.pow(1 - hit, 1.4),
        bloom = Math.sin((Math.min(1, hit * 4) * Math.PI) / 2);
      const grow = 0.3 + bloom * 0.7;
      switch (mode) {
        case 'wave':
          for (let j = 0; j < 3; j++) {
            this.strip(
              r.texture,
              (t) => {
                const a = (t - 0.5) * Math.PI * 1.35 + heading;
                const d = area * (0.35 + hit * 0.65) - j * 0.16;
                return pos(
                  Math.sin(a) * d,
                  0.3 + Math.sin(t * Math.PI) * (0.5 + Math.sin(hit * Math.PI) * 0.4),
                  Math.cos(a) * d,
                  ground,
                );
              },
              w * (1.3 - j * 0.18),
              fade * (0.85 - j * 0.15),
              true,
            );
          }
          break;
        case 'storm':
          for (let j = 0; j < 3; j++)
            this.strip(
              'soul',
              (t) => {
                const a = t * Math.PI * 2 + hit * r.turns * 3 + j * 2.1,
                  d = area * (0.2 + t * 0.6) * (1 - hit * 0.3);
                return pos(Math.cos(a) * d, t * 1.5, Math.sin(a) * d, ground);
              },
              w * 0.32,
              fade * 0.65,
              true,
            );
          break;
        case 'roots':
          for (let j = 0; j < 6; j++) {
            const a = (j * Math.PI) / 3 + r.turns;
            this.strip(
              'root',
              (t) =>
                pos(
                  Math.cos(a) * area * t * grow,
                  Math.sin(t * Math.PI) * (0.65 + hit * 0.7),
                  Math.sin(a) * area * t * grow,
                  ground,
                ),
              w * 0.65,
              fade,
              true,
              0x9dbd72,
            );
          }
          this.stamp(
            'root',
            pos(0, 0.7, 0, ground),
            area * 1.3,
            1.8,
            fade * 0.85,
            0,
            false,
            0xadd38c,
          );
          break;
        case 'quake':
          this.stamp(
            'crack',
            ground,
            area * 2 * grow,
            area * 2 * grow,
            fade * 0.85,
            heading,
            true,
            0xffb56e,
          );
          for (let j = 0; j < 4; j++)
            this.stamp(
              'smoke',
              pos(
                Math.cos(j * 1.57) * hit * area,
                0.2 + hit * 0.4,
                Math.sin(j * 1.57) * hit * area,
                ground,
              ),
              w,
              w * 0.6,
              fade * 0.32,
              j,
              false,
              0xbfb0a0,
              0.7,
            );
          break;
        case 'ward':
          for (let j = 0; j < (r.signature.startsWith('state:') ? 1 : 3); j++)
            this.strip(
              r.texture,
              (t) => {
                const a = t * Math.PI * 2 + j * 2.1 + hit * 0.35;
                return pos(
                  Math.cos(a) * 0.62,
                  0.45 + Math.sin(a + j) * 0.25,
                  Math.sin(a) * 0.62,
                  to,
                );
              },
              r.signature.startsWith('state:') ? 0.18 : 0.4,
              fade * 0.45,
              true,
            );
          this.stamp('sigil', pos(0, 0.02, 0, to), 1.2, 1.2, fade * 0.55, hit * 0.4, true);
          break;
        case 'sweep':
        case 'cut':
        case 'cleave':
        case 'snow':
        case 'shadow':
          for (let j = 0; j < (mode === 'shadow' ? 3 : mode === 'snow' ? 2 : 1); j++) {
            this.strip(
              'slash',
              (t) => {
                const a =
                  (t - 0.5) * (mode === 'sweep' ? Math.PI * 1.8 : Math.PI) +
                  heading +
                  j * 2 +
                  hit * 0.7;
                return pos(
                  Math.sin(a) * area * grow,
                  0.2 + Math.sin(t * Math.PI) * 0.35,
                  Math.cos(a) * area * grow,
                );
              },
              w * 0.9,
              fade,
            );
          }
          if (mode === 'shadow')
            for (let j = 0; j < 3; j++)
              this.stamp(
                'soul',
                pos(Math.cos(j * 2.1) * 0.7, 0.5, Math.sin(j * 2.1) * 0.7),
                0.5,
                1.2,
                fade * 0.45,
                j,
              );
          break;
        case 'lightning':
          for (let j = 0; j < 5; j++)
            this.strip(
              'lightning',
              (t) => {
                const a = j * Math.PI * 0.4,
                  jitter = Math.sin(t * 79 + j) * 0.14;
                return pos(
                  Math.cos(a) * t * area + jitter,
                  (1 - t) * 1.4,
                  Math.sin(a) * t * area + jitter,
                );
              },
              0.3,
              fade * 0.9,
              true,
            );
          break;
        case 'prism':
          this.stamp('sigil', ground, area * 1.8, area * 1.8, fade * 0.4, hit, true);
          for (let j = 0; j < 6; j++) {
            const a = (j * Math.PI) / 3 + hit * 0.6;
            this.stamp(
              'crystal',
              pos(
                Math.cos(a) * area * grow * 0.65,
                0.45 + Math.sin(hit * Math.PI) * 0.5,
                Math.sin(a) * area * grow * 0.65,
              ),
              w * 0.7,
              w * 1.2,
              fade,
              a,
              false,
              0xffb8f3,
              1.2,
            );
          }
          break;
        case 'swallow':
          for (let j = 0; j < 3; j++)
            this.strip(
              'acid',
              (t) => {
                const a = t * Math.PI * 3 + hit * 5 + j * 2.1,
                  d = (1 - t) * area * 0.6 * (1 - hit);
                return pos(Math.cos(a) * d, t * 0.4, Math.sin(a) * d);
              },
              w * 0.45,
              fade,
              true,
            );
          break;
        case 'web':
          this.stamp('web', ground, area * 2, area * 2, fade * 0.9, heading, true);
          this.stamp('web', pos(0, 0.55, 0, ground), area * 1.5, 1.3, fade * 0.5, 0);
          break;
        case 'seal':
          this.stamp('sigil', pos(0, 0.2, 0), w * 1.7, w * 1.7, fade * 0.9, hit * 0.25);
          this.stamp('lightning', pos(0, 0.65, 0), 0.45, 1.3, fade * 0.5);
          break;
        case 'portal':
        case 'launch':
          this.stamp(r.texture, ground, area * 1.2, area * 1.2, fade * 0.65, hit * r.turns, true);
          for (let j = 0; j < 3; j++)
            this.stamp(
              r.secondary,
              pos((j - 1) * 0.3, 0.25 + hit * 0.9, hit * 0.4),
              w * 0.5,
              w * 0.8,
              fade * 0.7,
              j * 0.5,
            );
          break;
        case 'bloom':
        case 'mend':
        case 'ascend':
          this.stamp(r.texture, ground, w * 1.7, w * 1.7, fade * 0.55, -hit * r.turns, true);
          for (let j = 0; j < 4; j++) {
            const a = (j * Math.PI) / 2 + hit * r.turns;
            this.stamp(
              r.secondary,
              pos(Math.cos(a) * w * 0.5, 0.2 + hit * 0.9, Math.sin(a) * w * 0.5),
              w * 0.45,
              w * 0.65,
              fade * 0.6,
              a,
            );
          }
          break;
        case 'breath':
          this.stamp(
            r.texture,
            pos(0, 0.35, 0),
            w * 1.5,
            w * 1.8,
            fade * 0.7,
            0,
            false,
            undefined,
            1.1,
            time * 0.1,
          );
          this.stamp(r.secondary, ground, area * 1.1, area * 1.1, fade * 0.4, heading, true);
          break;
        case 'phase':
          this.strip(r.texture, (t) => from.clone().lerp(to, t), w * 0.6, fade * 0.75);
          this.stamp(r.secondary, to, w * 1.3, w * 1.4, fade * 0.8, heading);
          break;
        default:
          this.stamp(
            r.texture,
            to,
            w * (1 + hit),
            w * (1 + hit),
            fade * 0.9,
            heading,
            false,
            undefined,
            1.1,
          );
          if (mode === 'shell' || mode === 'salvo')
            this.stamp(
              'smoke',
              pos(0, hit * 0.5, 0),
              w * (1 + hit * 1.5),
              w * (1 + hit),
              fade * 0.3,
              hit,
              false,
              0xa9aeb8,
              0.8,
            );
      }
      // Secondary debris is budgeted independently from the identifying main silhouette.
      for (let i = 0; i < particleCount; i++) {
        const a = noise(this.seed, i) * Math.PI * 2,
          d = (0.15 + noise(this.seed, i + 100) * area * Math.min(0.85, r.spread * 0.6)) * hit;
        const y = Math.sin(hit * Math.PI) * (0.2 + noise(this.seed, i + 200) * 0.7);
        const size = (0.08 + noise(this.seed, i + 300) * 0.13) * (1 - hit * 0.6);
        this.stamp(
          r.secondary,
          pos(Math.cos(a) * d, y, Math.sin(a) * d),
          size,
          size * 1.8,
          fade * 0.55,
          a + hit * r.turns,
          false,
          i % 3 === 0 ? this.art.palette.accent : this.art.palette.energy,
        );
      }
    }
    if (mode === 'prism' && phase.impacted) {
      for (let i = 0; i < 7; i++) {
        const a = (i * Math.PI * 2) / 7 + hit * 0.5,
          d = area * (0.2 + hit * 0.7);
        this.solid(
          this.crystal,
          pos(Math.cos(a) * d, 0.45 + Math.sin(hit * Math.PI) * 0.4, Math.sin(a) * d),
          0.55 + noise(this.seed, i) * 0.35,
          [0.3, a, 0.3],
          i % 2 ? 0xb999e0 : 0x9be3ec,
        );
      }
    }
    if (mode === 'launch' && phase.released) {
      for (let i = 0; i < 3; i++) {
        const t = phase.impacted ? Math.min(1, hit * 1.7) : p * 0.4;
        const v = from
          .clone()
          .add(new THREE.Vector3((i - 1) * (0.25 + t * 0.65), t * 0.8, -t * (0.9 + i * 0.3)));
        this.solid(this.drones, v, 0.35, [0, heading, 0], this.art.palette.secondary);
      }
    }
    if (mode === 'storm' && phase.impacted) {
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + hit * 3,
          d = area * (0.25 + noise(this.seed, i) * 0.25);
        this.solid(
          this.crystal,
          pos(Math.cos(a) * d, 0.2 + noise(this.seed, i + 8), Math.sin(a) * d),
          0.2,
          [a, hit * 4, a],
          0xcbbda2,
        );
      }
    }
    for (const mesh of [this.crystal, this.drones]) {
      mesh.visible = mesh.count > 0;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
    this.mesh.count = this.cursor;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.meta.needsUpdate = this.tint.needsUpdate = this.face.needsUpdate = true;
    this.ribbon.geometry.setDrawRange(0, this.strand * SEGMENTS * 6);
    this.ribbonPosition.needsUpdate =
      this.ribbonMeta.needsUpdate =
      this.ribbonTint.needsUpdate =
        true;
  }
  private solid(
    mesh: THREE.InstancedMesh,
    at: THREE.Vector3,
    scale: number,
    rotation: [number, number, number],
    tint: number,
  ): void {
    const i = mesh.count++;
    scratch.position.copy(at);
    scratch.rotation.set(...rotation);
    scratch.scale.setScalar(scale);
    scratch.updateMatrix();
    mesh.setMatrixAt(i, scratch.matrix);
    mesh.setColorAt(i, color.setHex(tint));
  }
  dispose(): void {
    for (const mesh of [this.crystal, this.drones]) {
      mesh.geometry.dispose();
      mesh.dispose();
    }
    this.solidMaterial.dispose();
    this.mesh.geometry.dispose();
    this.mesh.dispose();
    this.ribbon.geometry.dispose();
    this.group.removeFromParent();
  }
}
