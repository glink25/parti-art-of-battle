import { part } from './blueprint';
import type { ArtColor, ArtPart } from './types';

type V3 = [number, number, number];
type V2 = [number, number];

/** Individually drawn plate silhouettes; dimensions are in joint-local units. */
export function plate(
  name: string,
  color: ArtColor,
  position: V3,
  scale: V3,
  outline: V2[],
  parent?: string,
  rotation?: V3,
  surface: ArtPart['surface'] = 'enamel',
  holes?: V2[][],
): ArtPart {
  return {
    ...part(name, 'roundedBox', color, position, scale, rotation, false, parent),
    surface,
    profile: { outline, holes, depth: 1, bevel: 0.035 },
  };
}

export const armour: V2[] = [
  [-0.5, 0.28],
  [-0.3, 0.5],
  [0.3, 0.5],
  [0.5, 0.28],
  [0.43, -0.32],
  [0.2, -0.5],
  [-0.2, -0.5],
  [-0.43, -0.32],
];
export const chevron: V2[] = [
  [-0.5, 0.5],
  [0, 0.28],
  [0.5, 0.5],
  [0.46, -0.18],
  [0, -0.5],
  [-0.46, -0.18],
];
export const arch: V2[] = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.15],
  [0.42, 0.36],
  [0, 0.65],
  [-0.42, 0.36],
  [-0.5, 0.15],
];
export const archHole: V2[] = [
  [-0.31, -0.5],
  [-0.31, 0.1],
  [-0.24, 0.24],
  [0, 0.43],
  [0.24, 0.24],
  [0.31, 0.1],
  [0.31, -0.5],
];

export function detail(
  name: string,
  primitive: ArtPart['primitive'],
  color: ArtColor,
  position: V3,
  scale: V3,
  parent?: string,
  rotation?: V3,
  surface: ArtPart['surface'] = 'steel',
  emissive = false,
): ArtPart {
  return { ...part(name, primitive, color, position, scale, rotation, emissive, parent), surface };
}
