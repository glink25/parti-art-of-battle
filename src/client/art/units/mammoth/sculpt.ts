import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 0.88, 0.13],
    [
      [0, -0.04, -0.39, 0.17],
      [0, 0.05, -0.21, 0.34],
      [0, 0.08, 0.1, 0.36],
      [0, -0.03, 0.4, 0.29],
      [0, -0.06, 0.52, 0.12],
    ],
    undefined,
    [1, 1, 1],
  ),
  v(
    'neck',
    'secondary',
    [0, 0.04, -0.33],
    [
      [0, -0.04, 0.07, 0.24],
      [0, 0.16, -0.07, 0.29],
      [0, 0.23, -0.18, 0.19],
    ],
    'body',
  ),
  v(
    'head',
    'primary',
    [0, 0.14, -0.21],
    [
      [0, 0.14, 0.04, 0.16],
      [0, 0.1, -0.11, 0.24],
      [0, -0.05, -0.21, 0.2],
      [0, -0.18, -0.15, 0.12],
    ],
    'neck',
  ),
  v(
    'trunk',
    'primary',
    [0, -0.04, -0.3],
    [
      [0, 0.06, 0, 0.11],
      [0, -0.14, -0.065, 0.09],
      [0, -0.37, -0.1, 0.065],
      [0, -0.52, -0.2, 0.052],
      [0, -0.47, -0.34, 0.04],
      [0, -0.36, -0.38, 0.025],
    ],
    'head',
  ),
  q('nostrils', 'sphere', 'dark', [0, -0.4, -0.68], [0.048, 0.034, 0.05], 'head', undefined, 'fur'),
  s('crest', 'secondary', [0, 0.2, -0.22], [0.24, 0.28, 0.08], chevron, 'head', [-0.2, 0, 0]),
  q('gem', 'octa', 'energy', [0, 0.23, -0.28], [0.1, 0.13, 0.06], 'head', undefined, 'glass', true),
  v(
    'tail',
    'secondary',
    [0, -0.04, 0.5],
    [
      [0, 0, 0, 0.045],
      [0, -0.17, 0.14, 0.035],
      [0.06, -0.31, 0.18, 0.027],
      [0.07, -0.37, 0.16, 0.006],
    ],
    'body',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      'ear' + n,
      'secondary',
      [side * 0.23, 0.015, -0.01],
      [0.23, 0.35, 0.08],
      [
        [0, 0.5],
        [0.5, 0.28],
        [0.43, -0.27],
        [0, -0.5],
        [-0.43, -0.2],
        [-0.5, 0.22],
      ],
      'head',
      [0, -side * 0.4, side * 0.16],
      'fur',
    ),
    v(
      'tusk' + n,
      'ivory',
      [side * 0.15, -0.12, -0.18],
      [
        [0, 0, 0, 0.07],
        [side * 0.09, -0.13, -0.16, 0.06],
        [side * 0.14, -0.13, -0.36, 0.045],
        [side * 0.11, 0.02, -0.52, 0.026],
        [side * 0.05, 0.19, -0.57, 0.002],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
    q(
      'eye' + n,
      'sphere',
      'dark',
      [side * 0.2, 0.02, -0.205],
      [0.043, 0.04, 0.038],
      'head',
      undefined,
      'glass',
    ),
    q(
      'eyeGlint' + n,
      'sphere',
      'ivory',
      [side * 0.206, 0.032, -0.222],
      [0.012, 0.012, 0.012],
      'head',
    ),
  );
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n;
    parts.push(
      v(
        leg,
        'secondary',
        [side * 0.22, -0.12, fore ? -0.26 : 0.35],
        [
          [0, 0.04, 0, 0.14],
          [side * 0.02, -0.17, 0.025, 0.115],
          [side * 0.03, -0.4, 0.01, 0.1],
          [side * 0.03, -0.48, -0.015, 0.095],
        ],
        'body',
      ),
      q(
        leg + 'Foot',
        'sphere',
        'primary',
        [side * 0.03, -0.52, -0.015],
        [0.23, 0.15, 0.28],
        leg,
        undefined,
        'fur',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        q(
          leg + 'Nail' + i,
          'sphere',
          'ivory',
          [(i - 1) * 0.065, -0.015, -0.12],
          [0.055, 0.055, 0.035],
          leg + 'Foot',
          undefined,
          'stone',
        ),
      );
  }
  for (let i = 0; i < 6; i++)
    parts.push(
      v(
        'shag' + n + i,
        'primary',
        [side * (0.27 + (i < 3 ? 0.02 : 0)), -0.04, -0.24 + i * 0.12],
        [
          [0, 0.08, 0, 0.085],
          [side * 0.045, -0.09, 0.02, 0.075],
          [side * 0.025, -0.23, 0.045, 0.005],
        ],
        'body',
      ),
    );
}
for (let i = 0; i < 3; i++)
  parts.push(
    s(
      'saddle' + i,
      i % 2 ? 'accent' : 'secondary',
      [0, 0.36 - i * 0.008, -0.06 + i * 0.17],
      [0.45, 0.15, 0.18],
      armour,
      'body',
    ),
  );
export const clips = {
  attack: action('head', [-0.13, 0, 0], [0, 0, -0.045]),
  skill: {
    tracks: [...action('neck', [-0.16, 0, 0]).tracks, ...action('trunk', [0.3, 0, 0]).tracks],
  },
};
