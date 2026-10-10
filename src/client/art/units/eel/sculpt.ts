import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// An open S curve instead of a closed torus, with continuous dorsal fins and gill fans.
export const parts: ArtPart[] = [
  v(
    'coil',
    'primary',
    [0, 0.36, 0.09],
    [
      [0.31, -0.17, 0.5, 0.012],
      [0.42, -0.13, 0.32, 0.07],
      [0.31, -0.07, 0.04, 0.13],
      [-0.01, 0.015, -0.01, 0.155],
      [-0.28, 0.14, 0.15, 0.14],
      [-0.25, 0.36, 0.18, 0.125],
      [0, 0.57, 0.03, 0.1],
    ],
  ),
  v(
    'neck',
    'primary',
    [0, 0.57, 0.03],
    [
      [0, 0, 0, 0.1],
      [0.07, 0.12, -0.15, 0.09],
      [0.03, 0.2, -0.29, 0.085],
    ],
    'coil',
  ),
  v(
    'head',
    'secondary',
    [0.03, 0.2, -0.3],
    [
      [0, 0.01, 0.035, 0.08],
      [0, 0.03, -0.08, 0.13],
      [0, -0.025, -0.23, 0.07],
    ],
    'neck',
  ),
  v(
    'jaw',
    'ivory',
    [0, -0.075, -0.1],
    [
      [0, 0, 0.015, 0.063],
      [0, -0.01, -0.15, 0.06],
      [0, 0.015, -0.21, 0.028],
    ],
    'head',
    [1, 0.5, 1],
  ),
  v(
    'chin',
    'primary',
    [0, -0.09, -0.13],
    [
      [0, 0, 0, 0.022],
      [0, -0.12, 0.015, 0.012],
      [0.025, -0.19, 0.055, 0.001],
    ],
    'head',
  ),
  q(
    'core',
    'octa',
    'energy',
    [0, 0.125, -0.08],
    [0.065, 0.11, 0.06],
    'head',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.096, 0.06, -0.135],
      [0.05, 0.035, 0.03],
      'head',
      undefined,
      'glass',
      true,
    ),
    v(
      'barbel' + n,
      'ivory',
      [side * 0.07, -0.015, -0.215],
      [
        [0, 0, 0, 0.012],
        [side * 0.14, 0.015, -0.02, 0.01],
        [side * 0.22, 0.12, 0.06, 0.001],
      ],
      'head',
    ),
    s(
      'gill' + n,
      'secondary',
      [side * 0.095, 0.025, 0.035],
      [0.28, 0.33, 0.025],
      [
        [0, 0.5],
        [0.5, 0.4],
        [0.2, 0.15],
        [0.5, -0.15],
        [0.2, -0.15],
        [0.2, -0.5],
        [-0.5, -0.25],
      ],
      'head',
      [0, side * 0.8, 0],
      'fur',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'gillRay' + n + i,
        'ivory',
        [side * 0.1, 0.05, 0.025],
        [
          [0, 0, 0, 0.007],
          [side * (0.13 - i * 0.025), 0.1 - i * 0.08, 0.09, 0.003],
        ],
        'head',
      ),
    );
}
const crest: [number, number, number, number][] = [
  [-0.24, 0.29, 0.17, 0],
  [-0.25, 0.43, 0.16, 0.2],
  [-0.17, 0.55, 0.12, 0.5],
  [-0.05, 0.65, 0.04, 0.6],
  [0.055, 0.74, -0.1, 0.3],
];
crest.forEach(([x, y, z, a], i) =>
  parts.push(
    s(
      'crest' + i,
      'secondary',
      [x, y, z],
      [0.065, 0.2, 0.2],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.35, 0.25],
        [0, 0.5],
        [-0.5, 0.13],
      ],
      'coil',
      [0, 0, -a],
      'fur',
    ),
  ),
);
for (let i = 0; i < 4; i++)
  parts.push(
    s(
      'tailFin' + i,
      'secondary',
      [0.36 - i * 0.07, -0.035, 0.37 - i * 0.085],
      [0.05, 0.15, 0.17],
      chevron,
      'coil',
      [0, 0, 0.45],
      'fur',
    ),
  );
export const clips = {
  attack: {
    tracks: [
      ...action('neck', [-0.18, 0, 0], [0, 0, -0.035]).tracks,
      ...action('jaw', [-0.4, 0, 0]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...action('neck', [0.12, 0.2, 0]).tracks,
      ...action('core', [0, 0.4, 0], [0, 0.045, 0]).tracks,
      ...action('jaw', [-0.35, 0, 0]).tracks,
    ],
  },
};
