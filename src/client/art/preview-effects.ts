import * as THREE from 'three';
import type { GameResources } from '../resources';
import type { ArtPrimitive, EffectArt, UnitArtDefinition } from './core/types';

function geometry(kind: ArtPrimitive): THREE.BufferGeometry {
  switch (kind) {
    case 'box':
      return new THREE.BoxGeometry(0.22, 0.22, 0.5);
    case 'capsule':
      return new THREE.CapsuleGeometry(0.08, 0.34, 4, 7);
    case 'cone':
      return new THREE.ConeGeometry(0.13, 0.42, 7);
    case 'cylinder':
      return new THREE.CylinderGeometry(0.07, 0.1, 0.5, 7);
    case 'dodeca':
      return new THREE.DodecahedronGeometry(0.18, 0);
    case 'ico':
      return new THREE.IcosahedronGeometry(0.18, 0);
    case 'muscle':
    case 'roundedBox':
    case 'wedge':
      return new THREE.BoxGeometry(0.22, 0.22, 0.5);
    case 'octa':
      return new THREE.OctahedronGeometry(0.18, 0);
    case 'sphere':
      return new THREE.SphereGeometry(0.17, 9, 7);
    case 'torus':
      return new THREE.TorusGeometry(0.18, 0.045, 6, 20);
  }
}

/** Deterministic action visualization shared by all playground views. */
export class PreviewEffect {
  readonly group = new THREE.Group();
  private charge = new THREE.Group();
  private projectile = new THREE.Group();
  private impact = new THREE.Group();
  private beam?: THREE.Mesh;
  private materials: THREE.MeshBasicMaterial[] = [];
  private recipe: EffectArt;

  constructor(
    private resources: GameResources,
    private art: UnitArtDefinition,
    private kind: 'attack' | 'skill',
  ) {
    this.recipe = art[kind];
    const color = kind === 'skill' ? art.palette.energy : art.palette.primary;
    const bright = this.material(color, 0.94);
    const accent = this.material(art.palette.accent, 0.72);
    const core = new THREE.Mesh(resources.geometry(geometry(this.recipe.projectile)), bright);
    core.scale.setScalar(1 + this.recipe.width * 1.8);
    this.projectile.add(core);
    const trailCount =
      this.recipe.trail === 'none' ? 0 : Math.min(8, Math.ceil(this.recipe.particles / 4));
    for (let i = 0; i < trailCount; i++) {
      const mote = new THREE.Mesh(
        resources.geometry(
          i % 2 ? new THREE.OctahedronGeometry(0.055) : new THREE.TorusGeometry(0.07, 0.014, 4, 10),
        ),
        i % 2 ? accent : bright,
      );
      mote.position.set(Math.sin(i * 2.2) * 0.1, Math.cos(i * 1.7) * 0.08, 0.22 + i * 0.14);
      mote.scale.setScalar(1 - i * 0.07);
      this.projectile.add(mote);
    }
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        resources.geometry(new THREE.TorusGeometry(0.24 + i * 0.12, 0.025, 5, 24)),
        i === 1 ? accent : bright,
      );
      ring.rotation.x = Math.PI / 2;
      ring.userData.phase = i / 3;
      this.charge.add(ring);
    }
    const impactRing = new THREE.Mesh(
      resources.geometry(new THREE.TorusGeometry(kind === 'skill' ? 0.9 : 0.48, 0.05, 6, 36)),
      bright,
    );
    impactRing.rotation.x = Math.PI / 2;
    this.impact.add(impactRing);
    const count = Math.min(28, Math.max(6, this.recipe.particles));
    for (let i = 0; i < count; i++) {
      const particle = new THREE.Mesh(
        resources.geometry(
          this.recipe.impact === 'shards' || this.recipe.impact === 'crystal'
            ? new THREE.ConeGeometry(0.06, 0.28, 5)
            : new THREE.OctahedronGeometry(0.065),
        ),
        i % 3 === 0 ? accent : bright,
      );
      particle.userData.angle = (i / count) * Math.PI * 2;
      particle.userData.lift = (i % 4) / 4;
      this.impact.add(particle);
    }
    if (this.recipe.delivery === 'beam') {
      this.beam = new THREE.Mesh(
        resources.geometry(
          new THREE.CylinderGeometry(0.035 + this.recipe.width * 0.08, 0.08, 2.5, 7),
        ),
        bright,
      );
      this.beam.rotation.x = Math.PI / 2;
      this.beam.position.set(0, 0.78, -1.25);
      this.group.add(this.beam);
    }
    this.charge.position.set(0, 0.85, -0.25);
    this.impact.position.set(0, 0.08, -2.5);
    this.group.add(this.charge, this.projectile, this.impact);
    this.sample(0);
  }

  private material(color: number, opacity: number): THREE.MeshBasicMaterial {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(2.2),
      opacity,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    this.materials.push(material);
    return material;
  }

  sample(phase: number): void {
    const t = THREE.MathUtils.clamp(phase, 0, 1),
      release = 0.32,
      impactAt = 0.7;
    this.charge.visible = t < release;
    this.charge.rotation.y = t * this.recipe.spin;
    this.charge.scale.setScalar(0.3 + Math.sin((t / release) * Math.PI * 0.5) * 0.9);
    const inFlight = t >= release && t <= impactAt && this.recipe.delivery !== 'beam';
    this.projectile.visible = inFlight;
    if (inFlight) {
      const flight = (t - release) / (impactAt - release);
      this.projectile.position.set(
        0,
        0.85 + Math.sin(flight * Math.PI) * this.recipe.arc * 0.3,
        -0.25 - flight * 2.25,
      );
      this.projectile.rotation.z = flight * this.recipe.spin;
    }
    if (this.beam) {
      this.beam.visible = t >= release && t <= 0.78;
      this.beam.scale.set(1 + Math.sin(t * 45) * 0.12, 1, 1 + Math.sin(t * 45) * 0.12);
    }
    this.impact.visible = t >= 0.62;
    const hit = THREE.MathUtils.clamp((t - 0.62) / 0.38, 0, 1);
    this.impact.scale.setScalar(
      0.25 + Math.sin(hit * Math.PI * 0.72) * (this.kind === 'skill' ? 1.45 : 0.85),
    );
    this.impact.rotation.y = hit * this.recipe.spin * 0.35;
    for (let i = 1; i < this.impact.children.length; i++) {
      const particle = this.impact.children[i],
        angle = particle.userData.angle as number,
        radius = 0.3 + hit * (this.kind === 'skill' ? 1.15 : 0.62);
      particle.position.set(
        Math.cos(angle) * radius,
        0.12 + (particle.userData.lift as number) + Math.sin(hit * Math.PI) * 0.7,
        Math.sin(angle) * radius,
      );
      particle.rotation.z = angle + hit * 2.5;
    }
  }

  dispose(): void {
    for (const material of this.materials) material.dispose();
  }
}
