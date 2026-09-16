import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { carvedLimb, puppetFace, swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';

const cleaver: [number, number][] = [
  [-0.28, -0.5],
  [0.2, -0.5],
  [0.49, 0.18],
  [0.44, 0.5],
  [-0.5, 0.27],
  [-0.29, 0.15],
];
export const parts: ArtPart[] = [
  s('body', 'primary', [0, 0.68, 0], [0.35, 0.38, 0.27], armour, undefined, undefined, 'wood'),
  s('bib', 'secondary', [0, 0.06, -0.16], [0.3, 0.28, 0.04], chevron, 'body', undefined, 'cloth'),
  q('neck', 'cylinder', 'dark', [0, 0.21, -0.08], [0.11, 0.16, 0.11], 'body', [-0.3, 0, 0], 'wood'),
  q('head', 'muscle', 'primary', [0, 0.34, -0.16], [0.25, 0.29, 0.23], 'body', undefined, 'wood'),
  ...puppetFace('head', 0.24, 0.28, 0.3),
  s('cowl', 'secondary', [0, 0.13, 0.03], [0.33, 0.19, 0.28], armour, 'head', undefined, 'cloth'),
  s(
    'scarfTail',
    'secondary',
    [0, 0.16, 0.34],
    [0.29, 0.49, 0.045],
    [
      [-0.5, 0.5],
      [0.3, 0.3],
      [0.5, -0.5],
      [0, -0.3],
      [-0.4, -0.5],
    ],
    'body',
    [-0.65, 0, 0.2],
    'cloth',
  ),
  ...carvedLimb(
    'legL',
    [-0.11, -0.13, 0],
    [-0.27, -0.28, -0.17],
    [-0.33, -0.46, -0.12],
    0.125,
    'body',
  ),
  ...carvedLimb('legR', [0.11, -0.13, 0], [0.26, -0.28, 0.18], [0.34, -0.46, 0.25], 0.125, 'body'),
  ...carvedLimb('armL', [-0.22, 0.12, 0], [-0.39, 0.02, -0.06], [-0.47, -0.1, -0.28], 0.11, 'body'),
  ...carvedLimb('armR', [0.22, 0.12, 0], [0.37, 0.16, -0.13], [0.48, 0.24, -0.28], 0.11, 'body'),
  q(
    'belt',
    'roundedBox',
    'accent',
    [0, -0.14, -0.14],
    [0.33, 0.065, 0.04],
    'body',
    undefined,
    'cloth',
  ),
];
for (const side of [-1, 1]) {
  const k = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      `boot${k}`,
      'dark',
      [0, 0, -0.045],
      [0.19, 0.11, 0.25],
      armour,
      `leg${k}End`,
      undefined,
      'wood',
    ),
    q(
      `blade${k}`,
      'cylinder',
      'dark',
      [side * 0.08, 0.01, 0],
      [0.06, 0.19, 0.06],
      `arm${k}End`,
      [0, 0, -side * 0.95],
      'wood',
    ),
    s(
      `guard${k}`,
      'accent',
      [0, 0.1, 0],
      [0.2, 0.05, 0.07],
      chevron,
      `blade${k}`,
      undefined,
      'brass',
    ),
    s(
      `cleaver${k}`,
      'secondary',
      [0, 0.36, 0],
      [0.22, 0.53, 0.055],
      cleaver,
      `blade${k}`,
      undefined,
      'steel',
    ),
    s(
      `edge${k}`,
      'ivory',
      [0, 0.36, -0.034],
      [0.22, 0.53, 0.013],
      [
        [0.2, -0.5],
        [0.49, 0.18],
        [0.44, 0.5],
        [0.3, 0.42],
        [0.32, 0.18],
        [0.07, -0.5],
      ],
      `blade${k}`,
      undefined,
      'steel',
    ),
    q(
      `ring${k}`,
      'torus',
      'accent',
      [-0.055, 0.49, -0.04],
      [0.06, 0.06, 0.1],
      `blade${k}`,
      undefined,
      'brass',
    ),
  );
}
export const clips = {
  attack: swing('armR', [0.55, -0.7, -0.6]),
  skill: {
    tracks: [
      ...swing('armL', [0.4, 0.5, 0.65]).tracks,
      ...swing('armR', [0.4, -0.5, -0.65]).tracks,
      ...swing('body', [0, 0.4, 0]).tracks,
    ],
  },
};
