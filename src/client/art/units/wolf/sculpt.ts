import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// A low hunting posture, long muzzle, high shoulders and a swept brush tail.
export const parts: ArtPart[] = [
  v(
    'chest',
    'primary',
    [0, 0.7, -0.16],
    [
      [0, -0.02, -0.17, 0.1],
      [0, 0.05, 0, 0.25],
      [0, 0, 0.28, 0.2],
      [0, -0.055, 0.54, 0.15],
      [0, -0.05, 0.68, 0.095],
    ],
  ),
  v(
    'neck',
    'secondary',
    [0, 0.08, -0.16],
    [
      [0, 0, 0.06, 0.2],
      [0, 0.09, -0.13, 0.2],
      [0, 0.13, -0.28, 0.12],
    ],
    'chest',
  ),
  v(
    'head',
    'primary',
    [0, 0.15, -0.27],
    [
      [0, 0, 0.06, 0.12],
      [0, 0.02, -0.08, 0.15],
      [0, -0.035, -0.2, 0.09],
    ],
    'neck',
  ),
  v(
    'muzzle',
    'primary',
    [0, -0.035, -0.17],
    [
      [0, 0, 0, 0.09],
      [0, -0.01, -0.13, 0.067],
      [0, 0.005, -0.23, 0.045],
    ],
    'head',
    [1, 0.72, 1],
  ),
  q('nose', 'sphere', 'dark', [0, 0, -0.24], [0.105, 0.078, 0.075], 'muzzle', undefined, 'fur'),
  v(
    'jaw',
    'dark',
    [0, -0.08, -0.14],
    [
      [0, 0, 0.03, 0.064],
      [0, -0.025, -0.13, 0.059],
      [0, -0.005, -0.23, 0.035],
    ],
    'head',
    [1, 0.55, 1],
  ),
  v(
    'tailBase',
    'primary',
    [0, -0.035, 0.64],
    [
      [0, 0, 0, 0.1],
      [0.08, -0.05, 0.16, 0.12],
      [0.16, -0.16, 0.29, 0.105],
      [0.22, -0.28, 0.36, 0.06],
      [0.27, -0.29, 0.42, 0.002],
    ],
    'chest',
  ),
  v(
    'tailStripe',
    'secondary',
    [0.05, -0.05, 0.72],
    [
      [0, 0, 0, 0.075],
      [0.09, -0.09, 0.13, 0.08],
      [0.2, -0.24, 0.29, 0.006],
    ],
    'chest',
  ),
  q(
    'rift',
    'octa',
    'energy',
    [0, 0.23, -0.02],
    [0.075, 0.16, 0.07],
    'neck',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      'ear' + n,
      'secondary',
      [side * 0.13, 0.2, 0.015],
      [0.15, 0.29, 0.07],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.18, 0.5],
        [-0.2, 0.32],
      ],
      'head',
      [0, 0, -side * 0.12],
      'fur',
    ),
    s(
      'earInner' + n,
      'primary',
      [side * 0.13, 0.2, -0.025],
      [0.085, 0.19, 0.016],
      chevron,
      'head',
      [0, 0, -side * 0.12],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.116, 0.048, -0.128],
      [0.055, 0.035, 0.03],
      'head',
      undefined,
      'glass',
      true,
    ),
    s(
      'brow' + n,
      'secondary',
      [side * 0.12, 0.08, -0.11],
      [0.125, 0.035, 0.04],
      chevron,
      'head',
      [0, 0, -side * 0.2],
      'fur',
    ),
    v(
      'cheek' + n,
      'ivory',
      [side * 0.1, -0.06, -0.03],
      [
        [0, 0, 0, 0.07],
        [side * 0.07, -0.015, 0.07, 0.07],
        [side * 0.12, -0.05, 0.12, 0.004],
      ],
      'head',
    ),
    v(
      'fang' + n,
      'ivory',
      [side * 0.055, -0.045, -0.15],
      [
        [0, 0, 0, 0.018],
        [0, -0.06, 0.005, 0.002],
      ],
      'muzzle',
      [1, 1, 1],
      'stone',
    ),
  );
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n;
    parts.push(
      v(
        leg,
        'primary',
        [side * 0.19, -0.08, fore ? -0.055 : 0.5],
        [
          [0, 0.04, 0, 0.1],
          [side * 0.02, -0.12, fore ? 0.02 : -0.09, 0.08],
          [side * 0.03, -0.3, fore ? 0.025 : 0.085, 0.04],
          [side * 0.025, -0.4, fore ? -0.04 : 0.015, 0.034],
        ],
        'chest',
      ),
      q(
        leg + 'Paw',
        'sphere',
        'secondary',
        [side * 0.025, -0.405, fore ? -0.09 : -0.035],
        [0.14, 0.11, 0.21],
        leg,
        undefined,
        'fur',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        q(
          leg + 'Claw' + i,
          'cone',
          'ivory',
          [(i - 1) * 0.037, -0.002, -0.103],
          [0.026, 0.06, 0.026],
          leg + 'Paw',
          [-Math.PI / 2, 0, 0],
          'stone',
        ),
      );
  }
  for (let i = 0; i < 4; i++)
    parts.push(
      v(
        'ruff' + n + i,
        'secondary',
        [side * (0.15 + i * 0.015), 0.14 - i * 0.08, -0.04 + i * 0.055],
        [
          [0, 0, 0, 0.08],
          [side * 0.07, -0.025, 0.07, 0.075],
          [side * 0.1, -0.11, 0.13, 0.004],
        ],
        'neck',
      ),
    );
}
export const clips = {
  attack: {
    tracks: [
      ...action('neck', [-0.16, 0, 0], [0, -0.015, -0.04]).tracks,
      ...action('jaw', [-0.45, 0, 0]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...action('head', [0.3, 0, 0]).tracks,
      ...action('rift', [0, 0, 0.3], [0, 0.04, -0.04]).tracks,
      ...action('tailBase', [0, 0.25, 0]).tracks,
    ],
  },
};
