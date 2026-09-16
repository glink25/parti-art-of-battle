import { Euler, Quaternion, Vector3 } from 'three';
import { armour, detail as q, plate as s } from './sculpt';
import type { ArtAnimationClip, ArtColor, ArtPart } from './types';

type V3 = [number, number, number];

/** A two-joint carved limb, with its mesh oriented independently of its joint. */
export function carvedLimb(
  name: string,
  start: V3,
  elbow: V3,
  end: V3,
  width: number,
  parent: string,
  color: ArtColor = 'primary',
): ArtPart[] {
  const segment = (id: string, from: V3, to: V3, joint: string): ArtPart => {
    const direction = new Vector3(...to).sub(new Vector3(...from));
    const rotation = new Euler().setFromQuaternion(
      new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
    );
    return s(
      id,
      color,
      direction.clone().multiplyScalar(0.5).toArray(),
      [width, direction.length(), width * 0.85],
      armour,
      joint,
      [rotation.x, rotation.y, rotation.z],
      'wood',
    );
  };
  const middle: V3 = [elbow[0] - start[0], elbow[1] - start[1], elbow[2] - start[2]];
  const tip: V3 = [end[0] - elbow[0], end[1] - elbow[1], end[2] - elbow[2]];
  return [
    q(
      name,
      'sphere',
      'dark',
      start,
      [width * 1.1, width * 1.1, width * 1.1],
      parent,
      undefined,
      'wood',
    ),
    segment(`${name}Upper`, start, elbow, name),
    q(`${name}Elbow`, 'sphere', 'accent', middle, [width, width, width], name, undefined, 'brass'),
    segment(`${name}Lower`, elbow, end, `${name}Elbow`),
    q(
      `${name}End`,
      'roundedBox',
      'dark',
      tip,
      [width * 0.95, width * 0.85, width],
      `${name}Elbow`,
      undefined,
      'wood',
    ),
  ];
}

/** Family vocabulary only: carved face and exposed pins, never a complete model. */
export function puppetFace(parent: string, width: number, height: number, brow: number): ArtPart[] {
  return [
    s(
      'face',
      'ivory',
      [0, 0, -0.075],
      [width, height, 0.09],
      [
        [-0.5, 0.3],
        [-0.32, 0.5],
        [0.32, 0.5],
        [0.5, 0.3],
        [0.35, -0.3],
        [0, -0.5],
        [-0.35, -0.3],
      ],
      parent,
      undefined,
      'wood',
    ),
    q(
      'eyeL',
      'roundedBox',
      'dark',
      [-width * 0.23, 0.025, -0.13],
      [width * 0.24, 0.035, 0.02],
      parent,
      [0, 0, -brow],
      'wood',
    ),
    q(
      'eyeR',
      'roundedBox',
      'dark',
      [width * 0.23, 0.025, -0.13],
      [width * 0.24, 0.035, 0.02],
      parent,
      [0, 0, brow],
      'wood',
    ),
    s(
      'nose',
      'primary',
      [0, -0.025, -0.15],
      [0.055, 0.075, 0.055],
      [
        [0, 0.5],
        [0.5, -0.5],
        [-0.5, -0.5],
      ],
      parent,
      undefined,
      'wood',
    ),
    q(
      'mouth',
      'roundedBox',
      'dark',
      [0, -height * 0.23, -0.13],
      [width * 0.35, 0.015, 0.012],
      parent,
      undefined,
      'wood',
    ),
    q(
      'foreheadSeal',
      'octa',
      'energy',
      [0, height * 0.29, -0.14],
      [0.045, 0.067, 0.025],
      parent,
      undefined,
      'glass',
      true,
    ),
  ];
}

export function swing(part: string, peak: V3, at = 0.56): ArtAnimationClip {
  return {
    tracks: [
      {
        part,
        keyframes: [
          { at: 0, rotation: [0, 0, 0] },
          { at: 0.3, rotation: peak.map((v) => -v * 0.4) as V3 },
          { at, rotation: peak },
          { at: 1, rotation: [0, 0, 0] },
        ],
      },
    ],
  };
}
