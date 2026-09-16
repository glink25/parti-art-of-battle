import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export const BLOOM_LAYER = 1;

export function enableEffectBloom(object: THREE.Object3D): void {
  object.traverse((node) => node.layers.enable(BLOOM_LAYER));
}

/** Renders layer 1 into bloom, then adds it over the normal layer-0 scene. */
export class SelectiveBloom {
  private bloom: EffectComposer;
  private final: EffectComposer;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    private camera: THREE.Camera,
  ) {
    this.bloom = new EffectComposer(renderer);
    this.bloom.renderToScreen = false;
    this.bloom.addPass(new RenderPass(scene, camera));
    this.bloom.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.52, 0.25, 0.75));

    const combine = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloom.renderTarget2.texture },
        },
        vertexShader:
          'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform sampler2D baseTexture; uniform sampler2D bloomTexture; varying vec2 vUv; void main() { gl_FragColor = texture2D(baseTexture, vUv) + texture2D(bloomTexture, vUv); }',
        toneMapped: false,
      }),
      'baseTexture',
    );
    this.final = new EffectComposer(renderer);
    this.final.addPass(new RenderPass(scene, camera));
    this.final.addPass(combine);
    this.final.addPass(new OutputPass());
  }

  setSize(width: number, height: number): void {
    this.bloom.setSize(width, height);
    this.final.setSize(width, height);
  }

  render(): void {
    const mask = this.camera.layers.mask;
    this.camera.layers.set(BLOOM_LAYER);
    this.bloom.render();
    this.camera.layers.mask = mask;
    this.final.render();
  }

  dispose(): void {
    this.bloom.dispose();
    this.final.dispose();
  }
}
