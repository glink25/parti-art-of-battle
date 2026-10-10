import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 0.55, 0.015],
    [
      [0, 0, -0.3, 0.12],
      [0.1, 0.02, -0.05, 0.18],
      [0.02, -0.03, 0.27, 0.17],
      [-0.12, -0.08, 0.5, 0.13],
    ],
  ),
  v(
    'neck',
    'primary',
    [0, 0, -0.28],
    [
      [0, 0, 0.025, 0.13],
      [-0.05, 0.2, -0.12, 0.12],
      [0, 0.41, -0.19, 0.1],
    ],
    'body',
  ),
  v(
    'head',
    'primary',
    [0, 0.42, -0.21],
    [
      [0, 0, 0.045, 0.09],
      [0, 0.04, -0.09, 0.15],
      [0, -0.015, -0.26, 0.085],
    ],
    'neck',
  ),
  v(
    'muzzle',
    'ivory',
    [0, -0.025, -0.21],
    [
      [0, 0, 0, 0.077],
      [0, -0.01, -0.14, 0.07],
    ],
    'head',
    [1, 0.6, 1],
  ),
  v(
    'jaw',
    'secondary',
    [0, -0.095, -0.18],
    [
      [0, 0, 0.015, 0.075],
      [0, 0, -0.16, 0.06],
    ],
    'head',
    [1, 0.5, 1],
  ),
  v(
    'tail',
    'primary',
    [-0.12, -0.08, 0.48],
    [
      [0, 0, 0, 0.13],
      [-0.16, -0.11, 0.17, 0.095],
      [-0.14, -0.16, 0.38, 0.062],
      [0.04, -0.14, 0.49, 0.033],
      [0.18, -0.05, 0.47, 0.002],
    ],
    'body',
  ),
  q(
    'pearl',
    'sphere',
    'energy',
    [0, 0.13, -0.26],
    [0.11, 0.11, 0.11],
    'head',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  for (let i = 0; i < 5; i++)
    parts.push(
      s(
        'scale' + n + i,
        'accent',
        [side * 0.16 + (i < 2 ? 0.035 : -0.03), 0.015, -0.11 + i * 0.11],
        [0.09, 0.1, 0.035],
        chevron,
        'body',
        [0, (side * Math.PI) / 2, -0.3],
        'stone',
      ),
    );
  parts.push(
    v(
      'horn' + n,
      'ivory',
      [side * 0.09, 0.14, 0.025],
      [
        [0, 0, 0, 0.035],
        [side * 0.04, 0.15, 0.025, 0.026],
        [side * 0.1, 0.24, 0.11, 0.008],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
    v(
      'hornTine' + n,
      'ivory',
      [side * 0.12, 0.24, 0.04],
      [
        [0, 0, 0, 0.02],
        [side * 0.065, 0.11, -0.045, 0.002],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.115, 0.055, -0.163],
      [0.05, 0.04, 0.027],
      'head',
      undefined,
      'glass',
      true,
    ),
    s(
      'brow' + n,
      'secondary',
      [side * 0.115, 0.092, -0.14],
      [0.15, 0.05, 0.045],
      chevron,
      'head',
      undefined,
      'fur',
    ),
    v(
      'whisker' + n,
      'ivory',
      [side * 0.065, -0.025, -0.325],
      [
        [0, 0, 0, 0.013],
        [side * 0.14, -0.015, -0.04, 0.01],
        [side * 0.25, 0.075, 0, 0.007],
        [side * 0.28, 0.15, 0.06, 0.001],
      ],
      'head',
    ),
    s(
      'cheekFin' + n,
      'secondary',
      [side * 0.14, 0.015, 0.025],
      [0.23, 0.22, 0.035],
      [
        [0, 0.5],
        [0.5, 0.15],
        [0.22, 0.02],
        [0.5, -0.35],
        [0, -0.5],
        [-0.5, 0],
      ],
      'head',
      [0, side * 0.55, 0],
      'fur',
    ),
  );
  for (const fore of [true, false]) {
    const name = (fore ? 'fore' : 'hind') + n;
    parts.push(
      v(
        name,
        'primary',
        [side * 0.13, -0.055, fore ? -0.18 : 0.34],
        [
          [0, 0, 0, 0.062],
          [side * 0.15, -0.08, 0.035, 0.05],
          [side * 0.14, -0.24, -0.035, 0.03],
        ],
        'body',
      ),
      q(
        name + 'Foot',
        'sphere',
        'primary',
        [side * 0.14, -0.28, -0.06],
        [0.12, 0.1, 0.19],
        name,
        undefined,
        'fur',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        v(
          name + 'Claw' + i,
          'ivory',
          [(i - 1) * 0.038, -0.005, -0.07],
          [
            [0, 0, 0, 0.016],
            [0, -0.006, -0.065, 0.009],
            [0, 0.018, -0.09, 0.001],
          ],
          name + 'Foot',
          [1, 1, 1],
          'stone',
        ),
      );
  }
}
for (let i = 0; i < 6; i++)
  parts.push(
    s(
      'ridge' + i,
      'secondary',
      [0.06 - Math.max(0, i - 2) * 0.045, 0.17 - i * 0.018, -0.18 + i * 0.13],
      [0.085, 0.18, 0.1],
      chevron,
      'body',
      [0, Math.PI / 2, 0],
      'fur',
    ),
  );
for (let i = 0; i < 4; i++)
  parts.push(
    s(
      'throatPlate' + i,
      'ivory',
      [-0.025, 0.08 + i * 0.085, -0.105 - i * 0.027],
      [0.14, 0.065, 0.035],
      armour,
      'neck',
      undefined,
      'stone',
    ),
  );
export const clips = {
  attack: action('head', [-0.16, 0, 0], [0, 0, -0.045]),
  skill: {
    tracks: [
      ...action('neck', [0.15, 0.15, 0]).tracks,
      ...action('jaw', [-0.35, 0, 0]).tracks,
      ...action('tail', [0, 0.25, 0]).tracks,
    ],
  },
};
