import { detail } from './sculpt';
import type { ArtColor, ArtPart } from './types';
type V3 = [number, number, number];
type Spine = [number, number, number, number][];
/** Curved, tapered volumes only; species anatomy remains authored per unit. */
export function flesh(
  name: string,
  color: ArtColor,
  position: V3,
  points: Spine,
  parent?: string,
  scale: V3 = [1, 1, 1],
  surface: ArtPart['surface'] = 'fur',
): ArtPart {
  return {
    ...detail(name, 'muscle', color, position, scale, parent, undefined, surface),
    sweep: { points, segments: Math.max(10, (points.length - 1) * 5), sides: 10 },
  };
}
