import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { carvedLimb, puppetFace, swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';

const axe: [number, number][] = [
  [-0.1, 0.35],
  [0.25, 0.5],
  [0.55, 0.37],
  [0.65, 0.05],
  [0.54, -0.39],
  [0.18, -0.5],
  [0.24, -0.18],
  [-0.1, -0.13],
];
export const parts: ArtPart[] = [
  s('body', 'primary', [0, 0.75, 0.04], [0.56, 0.42, 0.34], armour, undefined, undefined, 'wood'),
  s(
    'chestHarness',
    'secondary',
    [0, 0.09, -0.19],
    [0.49, 0.13, 0.04],
    chevron,
    'body',
    undefined,
    'cloth',
  ),
  q('buckle', 'sphere', 'accent', [0, 0.025, -0.22], [0.1, 0.1, 0.045], 'body', undefined, 'brass'),
  q('neck', 'cylinder', 'dark', [0, 0.25, 0], [0.13, 0.14, 0.13], 'body', undefined, 'wood'),
  q('head', 'muscle', 'primary', [0, 0.37, -0.02], [0.31, 0.29, 0.26], 'body', undefined, 'wood'),
  ...puppetFace('head', 0.29, 0.27, 0.28),
  s(
    'mohawk',
    'secondary',
    [0, 0.19, 0.005],
    [0.09, 0.23, 0.25],
    [
      [0, 0.6],
      [0.5, 0.18],
      [0.5, -0.5],
      [-0.5, -0.5],
      [-0.5, 0.18],
    ],
    'head',
    undefined,
    'wood',
  ),
  ...carvedLimb('legL', [-0.18, -0.15, 0], [-0.25, -0.31, 0], [-0.3, -0.53, -0.035], 0.155, 'body'),
  ...carvedLimb('legR', [0.18, -0.15, 0], [0.25, -0.31, 0.04], [0.3, -0.53, 0.035], 0.155, 'body'),
  ...carvedLimb('armL', [-0.32, 0.13, 0], [-0.47, -0.02, 0], [-0.58, 0.08, -0.16], 0.14, 'body'),
  ...carvedLimb('armR', [0.32, 0.13, 0], [0.47, -0.02, 0], [0.58, 0.08, -0.16], 0.14, 'body'),
];
for (const side of [-1, 1]) {
  const k = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      `boot${k}`,
      'dark',
      [0, 0, -0.05],
      [0.22, 0.11, 0.25],
      armour,
      `leg${k}End`,
      undefined,
      'wood',
    ),
    s(`shoulder${k}`, 'secondary', [side * 0.3, 0.18, 0], [0.25, 0.19, 0.33], chevron, 'body'),
    q(
      `axe${k}`,
      'cylinder',
      'secondary',
      [0, 0.13, 0],
      [0.065, 0.54, 0.065],
      `arm${k}End`,
      [0, 0, side * -0.18],
      'wood',
    ),
    s(
      `axeHead${k}`,
      'secondary',
      [side * 0.025, 0.22, 0],
      [0.43, 0.36, 0.08],
      axe.map(([x, y]) => [x * side, y]),
      `axe${k}`,
      undefined,
      'steel',
    ),
    s(
      `axeEdge${k}`,
      'ivory',
      [side * 0.025, 0.22, -0.047],
      [0.43, 0.36, 0.015],
      [
        [0.55 * side, 0.37],
        [0.65 * side, 0.05],
        [0.54 * side, -0.39],
        [0.4 * side, -0.35],
        [0.49 * side, 0.05],
        [0.43 * side, 0.34],
      ],
      `axe${k}`,
      undefined,
      'steel',
    ),
    q(
      `axePin${k}`,
      'sphere',
      'accent',
      [0, 0.21, -0.055],
      [0.06, 0.06, 0.026],
      `axe${k}`,
      undefined,
      'brass',
    ),
  );
}
export const clips = {
  attack: swing('armR', [0.65, 0, -0.5]),
  skill: {
    tracks: [
      ...swing('armL', [0.9, -0.25, 0.5]).tracks,
      ...swing('armR', [0.9, 0.25, -0.5]).tracks,
    ],
  },
};
