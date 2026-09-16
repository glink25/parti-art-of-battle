import * as THREE from 'three';
import type { CombatAction } from '../../../domain/types';
import type { ArtAnimationClip, ArtPart, UnitArtDefinition, UnitModel } from './types';

export interface ArtResourceHost {
  geometry<T extends THREE.BufferGeometry>(geometry: T): T;
  artMaterial(
    color: number,
    emissive?: number,
    surface?: ArtPart['surface'],
  ): THREE.MeshStandardMaterial;
}

function geometry(part: ArtPart): THREE.BufferGeometry {
  if (part.sweep) {
    const { points, segments, sides } = part.sweep;
    const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const frames = curve.computeFrenetFrames(segments, false);
    const vertices: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments,
        center = curve.getPoint(t);
      const u = t * (points.length - 1),
        a = Math.min(points.length - 2, Math.floor(u));
      const radius = THREE.MathUtils.lerp(points[a][3], points[a + 1][3], u - a);
      for (let j = 0; j < sides; j++) {
        const angle = (j / sides) * Math.PI * 2;
        const v = center
          .clone()
          .addScaledVector(frames.normals[i], Math.cos(angle) * radius)
          .addScaledVector(frames.binormals[i], Math.sin(angle) * radius);
        vertices.push(v.x, v.y, v.z);
        if (i < segments) {
          const b = i * sides + j,
            c = i * sides + ((j + 1) % sides);
          indices.push(b, c, b + sides, c, c + sides, b + sides);
        }
      }
    }
    // Cap the two ends independently; pointed tips still have a small finite radius.
    for (const end of [0, segments]) {
      const center = curve.getPoint(end / segments),
        index = vertices.length / 3;
      vertices.push(center.x, center.y, center.z);
      for (let j = 0; j < sides; j++) {
        const a = end * sides + j,
          b = end * sides + ((j + 1) % sides);
        indices.push(...(end === 0 ? [index, b, a] : [index, a, b]));
      }
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    result.setIndex(indices);
    result.computeVertexNormals();
    (result as THREE.BufferGeometry & { parameters: unknown }).parameters = part.sweep;
    return result;
  }
  if (part.profile) {
    const { outline, holes = [], depth, bevel } = part.profile;
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const hole of holes)
      shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
    const result = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: bevel > 0,
      bevelSegments: 3,
      bevelSize: bevel,
      bevelThickness: bevel,
      steps: 1,
      curveSegments: 8,
    });
    result.translate(0, 0, -depth / 2);
    // The resource cache must distinguish silhouettes and holes, not just type.
    (result as THREE.BufferGeometry & { parameters: unknown }).parameters = part.profile;
    return result;
  }
  switch (part.primitive) {
    case 'box':
      return new THREE.BoxGeometry(1, 1, 1);
    case 'capsule':
      return new THREE.CapsuleGeometry(0.35, 0.5, 5, 8);
    case 'cone':
      return new THREE.ConeGeometry(0.5, 1, 6);
    case 'cylinder':
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
    case 'dodeca':
      return new THREE.DodecahedronGeometry(0.5, 0);
    case 'ico':
      return new THREE.IcosahedronGeometry(0.5, 0);
    case 'muscle':
      // A faceted, tapered organic volume. The asymmetric profile reads as
      // shoulder/thigh/torso mass instead of a uniformly inflated capsule.
      return new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.16, -0.5),
          new THREE.Vector2(0.4, -0.34),
          new THREE.Vector2(0.5, 0.08),
          new THREE.Vector2(0.34, 0.42),
          new THREE.Vector2(0.12, 0.5),
        ],
        8,
      );
    case 'octa':
      return new THREE.OctahedronGeometry(0.5, 0);
    case 'sphere':
      return new THREE.SphereGeometry(0.5, 8, 6);
    case 'torus':
      return new THREE.TorusGeometry(0.5, 0.12, 5, 20);
    case 'roundedBox': {
      const shape = new THREE.Shape();
      const r = 0.16;
      shape.moveTo(-0.5 + r, -0.5);
      shape.lineTo(0.5 - r, -0.5);
      shape.quadraticCurveTo(0.5, -0.5, 0.5, -0.5 + r);
      shape.lineTo(0.5, 0.5 - r);
      shape.quadraticCurveTo(0.5, 0.5, 0.5 - r, 0.5);
      shape.lineTo(-0.5 + r, 0.5);
      shape.quadraticCurveTo(-0.5, 0.5, -0.5, 0.5 - r);
      shape.lineTo(-0.5, -0.5 + r);
      shape.quadraticCurveTo(-0.5, -0.5, -0.5 + r, -0.5);
      const result = new THREE.ExtrudeGeometry(shape, {
        depth: 1,
        bevelEnabled: true,
        bevelSegments: 2,
        bevelSize: 0.07,
        bevelThickness: 0.07,
        curveSegments: 2,
      });
      result.translate(0, 0, -0.5);
      return result;
    }
    case 'wedge': {
      const result = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
        0.5, 0.5,
      ]);
      result.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      result.setIndex([0, 2, 1, 0, 3, 2, 3, 5, 2, 3, 4, 5, 0, 4, 3, 0, 1, 4, 1, 5, 4, 1, 2, 5]);
      result.computeVertexNormals();
      (result as THREE.BufferGeometry & { parameters: object }).parameters = {
        profile: 'wedge-v1',
      };
      return result;
    }
  }
}

export function createUnitModel(
  host: ArtResourceHost,
  art: UnitArtDefinition,
  side: number,
  seat: number,
  star: number,
): UnitModel {
  const root = new THREE.Group() as UnitModel;
  root.userData.art = art;
  root.userData.parts = new Map();
  root.userData.baseParts = new Map();
  // Authored feet rested on the old pedestal at y=.16. Move the artwork,
  // not the scene root or animation offsets, down to the board surface.
  const artwork = new THREE.Group();
  artwork.name = 'artwork';
  artwork.position.y = -0.16;
  root.add(artwork);
  root.userData.side = side;
  root.userData.seat = seat;
  const pending = [...art.parts];
  while (pending.length) {
    const index = pending.findIndex((spec) => !spec.parent || root.userData.parts.has(spec.parent));
    if (index < 0) throw new Error(`Invalid part hierarchy for ${art.id}`);
    const [spec] = pending.splice(index, 1);
    const color = art.palette[spec.color];
    // Keep articulation on an unscaled joint. Parenting directly to a scaled
    // mesh recursively crushed every descendant in detailed hierarchies.
    const joint = new THREE.Group();
    joint.name = spec.name;
    joint.position.fromArray(spec.position);
    if (spec.rotation) joint.rotation.set(...spec.rotation);
    const mesh = new THREE.Mesh(
      host.geometry(geometry(spec)),
      host.artMaterial(color, spec.emissive ? color : 0, spec.surface),
    );
    mesh.name = `${spec.name}:geometry`;
    mesh.scale.fromArray(spec.scale);
    joint.add(mesh);
    const parent = spec.parent ? root.userData.parts.get(spec.parent) : artwork;
    parent!.add(joint);
    root.userData.parts.set(spec.name, joint);
    root.userData.baseParts.set(spec.name, {
      position: joint.position.clone(),
      rotation: joint.rotation.clone(),
      scale: joint.scale.clone(),
    });
  }
  const upgrade = new THREE.Group();
  upgrade.name = 'star-upgrade';
  const marker = new THREE.Mesh(
    host.geometry(new THREE.OctahedronGeometry(0.075, 0)),
    host.artMaterial(art.palette.accent),
  );
  marker.name = 'two-star-marker';
  const crown = new THREE.Mesh(
    host.geometry(new THREE.OctahedronGeometry(0.13, 0)),
    host.artMaterial(art.palette.energy, art.palette.energy),
  );
  // Keep the promotion marker above the authored model, including tall weapons.
  root.updateMatrixWorld(true);
  crown.position.y = new THREE.Box3().setFromObject(root).max.y + 0.2;
  crown.name = 'three-star-crown';
  marker.position.set(-0.2, crown.position.y, 0);
  upgrade.add(marker, crown);
  root.add(upgrade);
  setUnitStar(root, star);
  return root;
}

export function setUnitStar(model: UnitModel, star: number): void {
  model.userData.star = star;
  const upgrade = model.getObjectByName('star-upgrade');
  const marker = model.getObjectByName('two-star-marker');
  const crown = model.getObjectByName('three-star-crown');
  if (upgrade) upgrade.visible = star >= 2;
  if (marker) {
    marker.visible = star >= 2;
    marker.position.x = star >= 3 ? -0.2 : 0;
  }
  if (crown) crown.visible = star >= 3;
}

export function animateUnitModel(
  model: UnitModel,
  time: number,
  action: CombatAction | null | undefined,
  playhead: number,
): void {
  const art = model.userData.art;
  model.rotation.z = 0;
  for (const [name, base] of model.userData.baseParts) {
    const part = model.userData.parts.get(name);
    if (!part) continue;
    part.position.copy(base.position);
    part.rotation.copy(base.rotation);
    part.scale.copy(base.scale);
  }
  const wave = Math.sin(time * 0.0018 * art.motion.tempo),
    amplitude = art.motion.amplitude;
  if (art.motion.idle === 'hover' || art.motion.idle === 'flutter')
    model.position.y += wave * amplitude;
  else if (art.motion.idle === 'coil' || art.motion.idle === 'breathe')
    model.scale.y *= 1 + wave * amplitude;
  else model.rotation.z += wave * amplitude * 0.15;
  const wing = model.userData.parts.get('wingL'),
    otherWing = model.userData.parts.get('wingR');
  if (wing) wing.rotation.y += wave * (art.motion.idle === 'flutter' ? 0.45 : 0.08);
  if (otherWing) otherWing.rotation.y -= wave * (art.motion.idle === 'flutter' ? 0.45 : 0.08);
  const crown = model.getObjectByName('three-star-crown');
  if (crown) crown.rotation.y = time * 0.002;
  if (!action || playhead < action.startedAt || playhead > action.recoverAt) return;
  const before = playhead < action.releaseAt;
  const phase = before
    ? (playhead - action.startedAt) / Math.max(1, action.releaseAt - action.startedAt)
    : 1 - (playhead - action.releaseAt) / Math.max(1, action.recoverAt - action.releaseAt);
  const amount = Math.sin(Math.max(0, Math.min(1, phase)) * Math.PI) * art.motion.recoil;
  const clip = art.clips?.[action.kind];
  if (clip) {
    const normalized = Math.max(
      0,
      Math.min(1, (playhead - action.startedAt) / Math.max(1, action.recoverAt - action.startedAt)),
    );
    sampleClip(model, clip, normalized);
    return;
  }
  const weapon = [...model.userData.parts.values()].at(-1);
  if (weapon) {
    if (art.motion[action.kind] === 'recoil' || art.motion[action.kind] === 'blast')
      weapon.position.z += amount * 0.25;
    else if (art.motion[action.kind] === 'slash') weapon.rotation.z += amount * 2.2;
    else if (art.motion[action.kind] === 'slam') weapon.rotation.x += amount * 1.8;
    else weapon.position.y += amount * 0.18;
  }
  model.rotation.x += amount * (art.motion[action.kind] === 'charge' ? -0.32 : 0.12);
}

function lerpTuple(
  from: [number, number, number] | undefined,
  to: [number, number, number] | undefined,
  alpha: number,
): [number, number, number] | undefined {
  if (!from && !to) return undefined;
  const a = from ?? to!;
  const b = to ?? from!;
  return [
    THREE.MathUtils.lerp(a[0], b[0], alpha),
    THREE.MathUtils.lerp(a[1], b[1], alpha),
    THREE.MathUtils.lerp(a[2], b[2], alpha),
  ];
}

/** Samples a clip as offsets from the authored rest transform. */
export function sampleClip(model: UnitModel, clip: ArtAnimationClip, phase: number): void {
  for (const track of clip.tracks) {
    const part = model.userData.parts.get(track.part),
      base = model.userData.baseParts.get(track.part);
    if (!part || !base || !track.keyframes.length) continue;
    const frames = track.keyframes;
    let left = frames[0],
      right = frames.at(-1)!;
    for (let i = 1; i < frames.length; i++) {
      if (phase <= frames[i].at) {
        left = frames[i - 1];
        right = frames[i];
        break;
      }
    }
    const alpha =
      right.at === left.at
        ? 0
        : THREE.MathUtils.clamp((phase - left.at) / (right.at - left.at), 0, 1);
    const position = lerpTuple(left.position, right.position, alpha),
      rotation = lerpTuple(left.rotation, right.rotation, alpha),
      scale = lerpTuple(left.scale, right.scale, alpha);
    if (position) part.position.copy(base.position).add(new THREE.Vector3(...position));
    if (rotation)
      part.rotation.set(
        base.rotation.x + rotation[0],
        base.rotation.y + rotation[1],
        base.rotation.z + rotation[2],
      );
    if (scale)
      part.scale.set(base.scale.x * scale[0], base.scale.y * scale[1], base.scale.z * scale[2]);
  }
}
