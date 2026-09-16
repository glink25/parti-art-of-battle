import { carvedLimb } from './puppet';
import { detail as q } from './sculpt';
import type { ArtPart, ArtAnimationClip } from './types';
type V3 = [number, number, number];
/** Shared hardware only; each machine authors its own chassis and silhouette. */
export function linkage(
  name: string,
  start: V3,
  bend: V3,
  end: V3,
  width: number,
  parent: string,
): ArtPart[] {
  return carvedLimb(name, start, bend, end, width, parent).map((p) => ({
    ...p,
    surface: p.name.endsWith('Elbow') ? 'brass' : 'steel',
  }));
}
export function barrel(name: string, position: V3, parent: string): ArtPart[] {
  return [
    q(name, 'cylinder', 'secondary', position, [0.13, 0.46, 0.13], parent, [Math.PI / 2, 0, 0]),
    q(
      name + 'Collar',
      'cylinder',
      'accent',
      [0, -0.15, 0],
      [0.19, 0.09, 0.19],
      name,
      undefined,
      'brass',
    ),
    q(name + 'Muzzle', 'torus', 'primary', [0, -0.245, 0], [0.15, 0.15, 0.12], name, [
      Math.PI / 2,
      0,
      0,
    ]),
    q(name + 'Bore', 'cylinder', 'dark', [0, -0.232, 0], [0.105, 0.02, 0.105], name),
  ];
}
export function action(part: string, rotation: V3, position: V3 = [0, 0, 0]): ArtAnimationClip {
  return {
    tracks: [
      {
        part,
        keyframes: [
          { at: 0, rotation: [0, 0, 0], position: [0, 0, 0] },
          { at: 0.3, rotation: rotation.map((v) => -v * 0.35) as V3, position: [0, 0, 0] },
          { at: 0.56, rotation, position },
          { at: 1, rotation: [0, 0, 0], position: [0, 0, 0] },
        ],
      },
    ],
  };
}
