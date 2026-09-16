import { carvedLimb } from './puppet';
import { armour, detail as q, plate as s } from './sculpt';
import type { ArtPart, ArtAnimationClip } from './types';
type V3 = [number, number, number];

/** Shared tailoring and weapon construction, never a complete character template. */
export function limb(
  name: string,
  start: V3,
  bend: V3,
  end: V3,
  width: number,
  parent: string,
): ArtPart[] {
  return carvedLimb(name, start, bend, end, width, parent).map((p) => ({
    ...p,
    surface: p.color === 'primary' ? 'cloth' : 'enamel',
    color: p.name.endsWith('Elbow') ? 'secondary' : p.color,
  }));
}
export function boots(): ArtPart[] {
  return ['L', 'R'].map((k) =>
    s(
      `boot${k}`,
      'dark',
      [0, -0.005, -0.045],
      [0.19, 0.1, 0.27],
      armour,
      `leg${k}End`,
      undefined,
      'cloth',
    ),
  );
}
export function face(parent: string): ArtPart[] {
  return [
    q('face', 'muscle', 'ivory', [0, 0, -0.035], [0.24, 0.28, 0.23], parent, undefined, 'cloth'),
    q(
      'nose',
      'roundedBox',
      'ivory',
      [0, -0.015, -0.185],
      [0.048, 0.065, 0.045],
      parent,
      undefined,
      'cloth',
    ),
    q(
      'eyeL',
      'roundedBox',
      'dark',
      [-0.064, 0.035, -0.165],
      [0.038, 0.025, 0.012],
      parent,
      undefined,
      'cloth',
    ),
    q(
      'eyeR',
      'roundedBox',
      'dark',
      [0.064, 0.035, -0.165],
      [0.038, 0.025, 0.012],
      parent,
      undefined,
      'cloth',
    ),
  ];
}
export function rifle(parent: string, sniper = false): ArtPart[] {
  const length = sniper ? 0.69 : 0.4;
  return [
    s(
      'weapon',
      'secondary',
      [0, 0.065, -0.12],
      [0.11, 0.14, 0.38],
      armour,
      parent,
      undefined,
      'steel',
    ),
    s(
      'stock',
      'primary',
      [0, -0.01, 0.25],
      [0.09, 0.18, 0.26],
      armour,
      'weapon',
      undefined,
      'cloth',
    ),
    q(
      'barrel',
      'cylinder',
      'dark',
      [0, 0.035, -0.2 - length / 2],
      [0.052, length, 0.052],
      'weapon',
      [Math.PI / 2, 0, 0],
    ),
    q(
      'muzzle',
      'cylinder',
      'secondary',
      [0, 0.035, -0.23 - length],
      [0.095, 0.12, 0.095],
      'weapon',
      [Math.PI / 2, 0, 0],
    ),
    q(
      'bore',
      'cylinder',
      'dark',
      [0, 0.035, -0.295 - length],
      [0.059, 0.008, 0.059],
      'weapon',
      [Math.PI / 2, 0, 0],
      'cloth',
    ),
    s('magazine', 'dark', [0, -0.14, -0.035], [0.075, 0.21, 0.1], armour, 'weapon', [0.15, 0, 0]),
    q(
      'optic',
      'cylinder',
      'secondary',
      [0, 0.14, -0.04],
      [sniper ? 0.11 : 0.072, sniper ? 0.28 : 0.14, sniper ? 0.11 : 0.072],
      'weapon',
      [Math.PI / 2, 0, 0],
    ),
    q(
      'lens',
      'sphere',
      'energy',
      [0, 0.14, sniper ? -0.187 : -0.118],
      [0.065, 0.065, 0.018],
      'weapon',
      undefined,
      'glass',
      true,
    ),
  ];
}
export function recoil(amount: number): ArtAnimationClip {
  return {
    tracks: [
      {
        part: 'torso',
        keyframes: [
          { at: 0, position: [0, 0, 0] },
          { at: 0.42, position: [0, 0, 0] },
          { at: 0.56, position: [0, 0, amount] },
          { at: 1, position: [0, 0, 0] },
        ],
      },
    ],
  };
}
