import * as THREE from 'three';
import { UNITS, UNIT_BY_ID } from '../content';
/** Shared, code-native unit art. Portraits and live pieces use exactly the same model factory. */
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
    const key = `${color}:${emissive}`;
    let m = this.materials.get(key);
    if (!m) {
      m = new THREE.MeshStandardMaterial({
        color,
        emissive,
        emissiveIntensity: 0.4,
        roughness: 0.72,
        metalness: 0.22,
        flatShading: true,
      });
      this.materials.set(key, m);
    }
    return m;
  }
  unit(defId: string, side = 0, seat = 0): THREE.Group {
    const d = UNIT_BY_ID[defId],
      g = new THREE.Group(),
      index = UNITS.findIndex((u) => u.id === defId),
      variant = index % 5;
    const part = (
      geometry: THREE.BufferGeometry,
      color: number,
      x: number,
      y: number,
      z: number,
    ) => {
      const m = new THREE.Mesh(this.geometry(geometry), this.material(color));
      m.position.set(x, y, z);
      g.add(m);
      return m;
    };
    part(
      new THREE.CylinderGeometry(0.34, 0.4, 0.12, 8),
      side ? 0xb75446 : seat ? 0xd3ad5c : 0x609eaf,
      0,
      0.12,
      0,
    );
    const metal = 0x344247,
      ivory = 0xe8d9ad;
    if (d.shape === 'mech') {
      for (const x of [-0.28, 0.28])
        part(new THREE.BoxGeometry(0.18, 0.22, 0.68), metal, x, 0.27, 0);
      part(new THREE.BoxGeometry(0.57, 0.34, 0.5), d.color, 0, 0.47, 0);
      const turret = part(new THREE.BoxGeometry(0.36, 0.23, 0.33), d.color, 0, 0.74, 0);
      turret.rotation.y = (variant - 2) * 0.07;
      for (let i = 0; i < (variant === 3 ? 2 : 1); i++)
        part(
          new THREE.BoxGeometry(0.1, 0.1, 0.56),
          metal,
          variant === 3 ? (i - 0.5) * 0.19 : 0,
          0.76,
          -0.31,
        );
      part(new THREE.OctahedronGeometry(0.09), 0x82e5ed, 0, 0.64, -0.26);
      if (d.layer === 'air')
        for (const x of [-0.43, 0.43])
          part(new THREE.BoxGeometry(0.47, 0.07, 0.22), ivory, x, 0.57, 0.05);
    } else if (d.shape === 'beast') {
      const body = part(new THREE.IcosahedronGeometry(0.37, 0), d.color, 0, 0.49, 0);
      body.scale.set(1, 0.85, 1.25);
      for (const x of [-0.22, 0.22])
        for (const z of [-0.22, 0.22])
          part(new THREE.CylinderGeometry(0.075, 0.095, 0.31, 5), metal, x, 0.26, z);
      part(new THREE.IcosahedronGeometry(0.25, 0), d.color, 0, 0.67, -0.35);
      for (const x of [-0.15, 0.15]) {
        const horn = part(
          new THREE.ConeGeometry(0.08, 0.23 + variant * 0.025, 4),
          ivory,
          x,
          0.92,
          -0.36,
        );
        horn.rotation.z = x * 1.8;
      }
      part(new THREE.BoxGeometry(0.18, 0.07, 0.05), 0xffd58d, 0, 0.73, -0.57);
    } else {
      for (const x of [-0.13, 0.13])
        part(new THREE.BoxGeometry(0.17, 0.27, 0.2), metal, x, 0.29, 0);
      const torso = part(
        d.shape === 'mystic'
          ? new THREE.ConeGeometry(0.33, 0.58, 6)
          : new THREE.CylinderGeometry(0.23, 0.29, 0.42, 6),
        d.color,
        0,
        0.6,
        0,
      );
      if (d.shape === 'mystic') torso.rotation.y = Math.PI / 6;
      part(new THREE.IcosahedronGeometry(0.19, 1), ivory, 0, 0.94, -0.025);
      part(new THREE.BoxGeometry(0.28, 0.055, 0.08), 0x213635, 0, 0.96, -0.17);
      for (const x of [-0.3, 0.3])
        part(new THREE.IcosahedronGeometry(0.14, 0), d.color, x, 0.73, 0);
      if (d.shape === 'mystic') {
        part(new THREE.CylinderGeometry(0.035, 0.045, 0.95, 5), metal, 0.39, 0.62, -0.05);
        part(new THREE.OctahedronGeometry(0.15), 0xcfa6ff, 0.39, 1.17, -0.05);
        part(new THREE.ConeGeometry(0.24, 0.25, 5), d.color, 0, 1.14, 0);
      } else if (d.tags.includes('guard')) {
        const shield = part(new THREE.BoxGeometry(0.34, 0.47, 0.09), d.color, -0.29, 0.59, -0.23);
        shield.rotation.z = -0.1;
        part(new THREE.BoxGeometry(0.045, 0.28, 0.025), ivory, -0.29, 0.61, -0.29);
      } else {
        part(new THREE.BoxGeometry(0.12, 0.14, 0.56 + variant * 0.03), metal, 0.26, 0.66, -0.24);
        part(new THREE.BoxGeometry(0.08, 0.04, 0.13), ivory, 0.26, 0.78, -0.26);
      }
    }
    return g;
  }
  portrait(defId: string): string {
    if (!this.portraits.size) {
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(192, 192);
      renderer.setPixelRatio(1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(),
        camera = new THREE.OrthographicCamera(-0.85, 0.85, 0.85, -0.85, 0.1, 20);
      camera.position.set(2, 1.8, -3);
      camera.lookAt(0, 0.55, 0);
      scene.add(new THREE.HemisphereLight(0xeaffff, 0x354735, 2.5));
      const key = new THREE.DirectionalLight(0xffedba, 3.5);
      key.position.set(-3, 5, 3);
      scene.add(key);
      for (const def of UNITS) {
        const model = this.unit(def.id);
        model.rotation.y = -0.4;
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
    for (const g of this.geometries.values()) g.dispose();
    for (const m of this.materials.values()) m.dispose();
    this.portraits.clear();
  }
}
