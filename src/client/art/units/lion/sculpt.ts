import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 0.76, 0.1],
    [
      [0, 0, -0.36, 0.13],
      [0, 0.025, -0.2, 0.25],
      [0, -0.025, 0.17, 0.23],
      [0, -0.04, 0.44, 0.16],
      [0, -0.02, 0.5, 0.06],
    ],
    undefined,
    [1, 1, 1],
  ),
  v(
    'neck',
    'secondary',
    [0, 0.06, -0.35],
    [
      [0, -0.08, 0.06, 0.18],
      [0, 0.12, -0.04, 0.29],
      [0, 0.28, -0.12, 0.23],
    ],
    'body',
  ),
  v(
    'head',
    'primary',
    [0, 0.24, -0.14],
    [
      [0, 0, 0.07, 0.15],
      [0, 0.03, -0.08, 0.2],
      [0, -0.02, -0.21, 0.14],
    ],
    'neck',
  ),
  v(
    'jaw',
    'secondary',
    [0, -0.13, -0.18],
    [
      [0, 0, 0.045, 0.07],
      [0, 0, -0.12, 0.105],
      [0, 0.02, -0.2, 0.065],
    ],
    'head',
    [1, 0.55, 1],
  ),
  q(
    'muzzleL',
    'sphere',
    'ivory',
    [-0.066, -0.045, -0.235],
    [0.17, 0.12, 0.16],
    'head',
    undefined,
    'fur',
  ),
  q(
    'muzzleR',
    'sphere',
    'ivory',
    [0.066, -0.045, -0.235],
    [0.17, 0.12, 0.16],
    'head',
    undefined,
    'fur',
  ),
  s('nose', 'dark', [0, -0.01, -0.313], [0.12, 0.07, 0.04], chevron, 'head', undefined, 'fur'),
  v(
    'tail',
    'primary',
    [0, -0.035, 0.43],
    [
      [0, 0, 0, 0.052],
      [0.13, 0.07, 0.2, 0.042],
      [0.21, 0.25, 0.33, 0.033],
      [0.12, 0.4, 0.38, 0.027],
    ],
    'body',
  ),
  v(
    'tuft',
    'secondary',
    [0.12, 0.4, 0.81],
    [
      [0, 0, 0, 0.065],
      [-0.03, 0.06, 0.03, 0.085],
      [-0.07, 0.11, 0.05, 0.002],
    ],
    'body',
  ),
];
for (let i = 0; i < 13; i++) {
  const a = (i / 13) * Math.PI * 2,
    x = Math.sin(a),
    y = Math.cos(a);
  parts.push(
    v(
      'mane' + i,
      i % 3 === 0 ? 'accent' : 'secondary',
      [x * 0.22, 0.16 + y * 0.23, -0.055],
      [
        [0, 0, 0.045, 0.12],
        [x * 0.055, y * 0.075, -0.02, 0.115],
        [x * 0.09, y * 0.12, 0.1, 0.018],
      ],
      'neck',
      [1, 1, 1],
    ),
  );
}
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'ear' + n,
      'sphere',
      'primary',
      [side * 0.18, 0.19, -0.005],
      [0.14, 0.15, 0.085],
      'head',
      undefined,
      'fur',
    ),
    q(
      'earInner' + n,
      'sphere',
      'secondary',
      [side * 0.18, 0.195, -0.044],
      [0.082, 0.085, 0.025],
      'head',
      undefined,
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.135, 0.065, -0.197],
      [0.075, 0.038, 0.038],
      'head',
      undefined,
      'glass',
      true,
    ),
    s(
      'brow' + n,
      'secondary',
      [side * 0.14, 0.102, -0.18],
      [0.15, 0.055, 0.055],
      chevron,
      'head',
      [0, 0, -side * 0.13],
      'fur',
    ),
    v(
      'fang' + n,
      'ivory',
      [side * 0.085, -0.075, -0.26],
      [
        [0, 0, 0, 0.023],
        [0, -0.075, 0.015, 0.002],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
  );
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n,
      z = fore ? -0.24 : 0.35;
    parts.push(
      v(
        leg,
        'primary',
        [side * 0.19, -0.08, z],
        [
          [0, 0.07, 0, 0.12],
          [side * 0.025, -0.11, fore ? 0.015 : -0.075, 0.1],
          [side * 0.015, -0.29, fore ? 0.005 : 0.07, 0.055],
          [side * 0.035, -0.44, -0.015, 0.045],
        ],
        'body',
      ),
      q(
        leg + 'Paw',
        'sphere',
        'primary',
        [side * 0.035, -0.455, -0.055],
        [0.19, 0.12, 0.24],
        leg,
        undefined,
        'fur',
      ),
    );
    for (let j = 0; j < 3; j++)
      parts.push(
        q(
          leg + 'Toe' + j,
          'sphere',
          'ivory',
          [(j - 1) * 0.048, -0.008, -0.09],
          [0.042, 0.04, 0.06],
          leg + 'Paw',
          undefined,
          'stone',
        ),
      );
  }
}
export const clips = {
  attack: {
    tracks: [
      ...action('head', [-0.16, 0.13, 0], [0, 0, -0.035]).tracks,
      ...action('foreR', [-0.45, 0, -0.08]).tracks,
    ],
  },
  skill: {
    tracks: [...action('head', [0.25, 0, 0]).tracks, ...action('jaw', [-0.45, 0, 0]).tracks],
  },
};
