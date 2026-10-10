import { flesh as v } from '../../core/organic';
import { detail as q, plate as s, chevron } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'ivory',
    [0, 0.68, 0],
    [
      [0, -0.27, 0, 0.19],
      [0, -0.12, 0, 0.36],
      [0, 0.15, 0, 0.36],
      [0, 0.31, 0, 0.19],
    ],
    undefined,
    [1, 1, 0.82],
  ),
  q('head', 'sphere', 'ivory', [0, 1.18, -0.06], [0.56, 0.49, 0.48], undefined, undefined, 'fur'),
  q('muzzle', 'sphere', 'ivory', [0, -0.065, -0.22], [0.32, 0.18, 0.17], 'head', undefined, 'fur'),
  q('nose', 'sphere', 'dark', [0, -0.02, -0.3], [0.11, 0.07, 0.055], 'head', undefined, 'fur'),
  v(
    'mouth',
    'dark',
    [0, -0.1, -0.294],
    [
      [-0.075, 0, 0, 0.009],
      [0, -0.015, 0, 0.01],
      [0.075, 0, 0, 0.009],
    ],
    'head',
  ),
  s(
    'sash',
    'accent',
    [0, 0.5, -0.245],
    [0.53, 0.12, 0.045],
    chevron,
    undefined,
    undefined,
    'cloth',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'ear' + n,
      'sphere',
      'dark',
      [side * 0.23, 0.19, 0],
      [0.2, 0.2, 0.13],
      'head',
      undefined,
      'fur',
    ),
    q(
      'innerEar' + n,
      'sphere',
      'secondary',
      [side * 0.23, 0.19, -0.065],
      [0.105, 0.11, 0.018],
      'head',
      undefined,
      'fur',
    ),
    q(
      'patch' + n,
      'sphere',
      'dark',
      [side * 0.14, 0.008, -0.204],
      [0.17, 0.2, 0.065],
      'head',
      [0, 0, side * 0.35],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'ivory',
      [side * 0.13, 0.023, -0.24],
      [0.055, 0.055, 0.022],
      'head',
      undefined,
      'glass',
    ),
    q(
      'pupil' + n,
      'sphere',
      'dark',
      [side * 0.125, 0.023, -0.253],
      [0.027, 0.033, 0.012],
      'head',
      undefined,
      'glass',
    ),
  );
}
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'leg' + n,
      'dark',
      [side * 0.12, 0.36, 0],
      [
        [0, 0, 0, 0.17],
        [side * 0.28, 0, -0.12, 0.18],
        [side * 0.25, -0.08, -0.32, 0.12],
        [-side * 0.03, -0.1, -0.38, 0.09],
      ],
    ),
    v(
      'arm' + n,
      'dark',
      [side * 0.29, 0.9, 0],
      [
        [0, 0, 0, 0.13],
        [side * 0.18, -0.18, -0.1, 0.12],
        [side * 0.13, -0.28, -0.32, 0.1],
      ],
      undefined,
    ),
    q(
      'palm' + n,
      'sphere',
      'ivory',
      [side * 0.13, -0.28, -0.34],
      [0.18, 0.1, 0.16],
      'arm' + n,
      undefined,
      'fur',
    ),
    s(
      'robe' + n,
      'secondary',
      [side * 0.2, 0.66, 0.05],
      [0.37, 0.65, 0.45],
      chevron,
      undefined,
      [0, 0, side * 0.25],
      'cloth',
    ),
  );
}
for (let i = 0; i < 11; i++) {
  const a = (i / 10) * Math.PI;
  parts.push(
    q(
      'bead' + i,
      'sphere',
      'accent',
      [Math.cos(a) * 0.28, 0.99 - Math.sin(a) * 0.2, -0.27],
      [0.065, 0.065, 0.065],
      undefined,
      undefined,
      'wood',
    ),
  );
}
parts.push(
  q(
    'orb',
    'sphere',
    'energy',
    [0, 0.72, -0.52],
    [0.22, 0.22, 0.22],
    undefined,
    undefined,
    'glass',
    true,
  ),
);
export const clips = {
  attack: action('armR', [-0.3, 0, -0.2]),
  skill: action('orb', [0, 0.6, 0], [0, 0.28, 0]),
};
