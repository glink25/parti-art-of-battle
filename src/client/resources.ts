import * as THREE from 'three';
import { UNITS } from '../content';
import { createUnitModel, setUnitStar } from './art/core/model';
import type { ArtPart, UnitModel } from './art/core/types';
import { UNIT_ART } from './art/registry';

/** Shared GPU resources. Every unit's actual construction lives in its own art module. */
export class GameResources {
  private geometries = new Map<string, THREE.BufferGeometry>();
  private materials = new Map<string, THREE.MeshStandardMaterial>();
  private portraits = new Map<string, string>();
  geometry<T extends THREE.BufferGeometry>(g: T): T {
    const key = JSON.stringify([g.type, (g as T & { parameters?: unknown }).parameters]);
    const old = this.geometries.get(key);
    if (old) {
      g.dispose();
      return old as T;
    }
    this.geometries.set(key, g);
    return g;
  }
  material(color: number, emissive = 0): THREE.MeshStandardMaterial {
    return this.artMaterial(color, emissive);
  }
  artMaterial(
    color: number,
    emissive = 0,
    surface?: ArtPart['surface'],
  ): THREE.MeshStandardMaterial {
    const key = `${color}:${emissive}:${surface ?? 'default'}`;
    let material = this.materials.get(key);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color,
        emissive,
        // Unit energy accents remain readable but never become a second light source.
        // HDR additive combat materials are the only materials intended to bloom.
        emissiveIntensity: emissive ? 0.08 : 0,
        roughness:
          surface === 'glass'
            ? 0.18
            : surface === 'steel'
              ? 0.32
              : surface === 'brass'
                ? 0.38
                : surface === 'enamel'
                  ? 0.42
                  : 0.7,
        metalness:
          surface === 'wood' || surface === 'cloth' || surface === 'fur'
            ? 0
            : surface === 'steel'
              ? 0.78
              : surface === 'brass'
                ? 0.68
                : surface === 'enamel'
                  ? 0.3
                  : 0.1,
        flatShading: !surface,
      });
      this.materials.set(key, material);
    }
    return material;
  }
  unit(defId: string, side = 0, seat = 0, star = 1): UnitModel {
    const art = UNIT_ART[defId];
    if (!art) throw new Error(`Missing independent art module: ${defId}`);
    return createUnitModel(this, art, side, seat, star);
  }
  setStar(model: THREE.Group, star: number): void {
    setUnitStar(model as UnitModel, star);
  }
  portrait(defId: string): string {
    if (!this.portraits.size) {
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(192, 192);
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
      camera.position.set(2.5, 1.8, -3.8);
      camera.lookAt(0, 0.65, 0);
      scene.add(new THREE.HemisphereLight(0xf3fbff, 0x28304a, 2.8));
      const key = new THREE.DirectionalLight(0xffe6ba, 2.4);
      key.position.set(-3, 5, 3);
      scene.add(key);
      for (const def of UNITS) {
        const art = UNIT_ART[def.id],
          model = this.unit(def.id);
        model.rotation.y = art.portrait.yaw;
        model.rotation.x = art.portrait.pitch;
        model.scale.setScalar(art.portrait.scale);
        scene.add(model);
        renderer.render(scene, camera);
        this.portraits.set(def.id, renderer.domElement.toDataURL('image/png'));
        scene.remove(model);
      }
      renderer.dispose();
      renderer.forceContextLoss();
    }
    return this.portraits.get(defId) ?? '';
  }
  dispose(): void {
    for (const geometry of this.geometries.values()) geometry.dispose();
    for (const material of this.materials.values()) material.dispose();
    this.portraits.clear();
  }
}
