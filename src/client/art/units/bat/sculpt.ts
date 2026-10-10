import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 1.02, 0],
    [
      [0, -0.19, 0.03, 0.065],
      [0, -0.04, 0, 0.14],
      [0, 0.15, 0, 0.13],
      [0, 0.22, 0, 0.07],
    ],
  ),
  q('head', 'sphere', 'primary', [0, 0.23, -0.075], [0.29, 0.27, 0.26], 'body', undefined, 'fur'),
  s('nose', 'secondary', [0, 0.23, -0.22], [0.12, 0.1, 0.055], chevron, 'body', undefined, 'fur'),
  q('mouth', 'sphere', 'dark', [0, 0.15, -0.205], [0.13, 0.095, 0.035], 'body', undefined, 'fur'),
  v(
    'tail',
    'secondary',
    [0, -0.19, 0.05],
    [
      [0, 0, 0, 0.025],
      [0, -0.13, 0.12, 0.014],
      [0, -0.2, 0.19, 0.001],
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
      [side * 0.12, 0.4, -0.045],
      [0.14, 0.27, 0.055],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.3, 0.5],
        [-0.25, 0.3],
      ],
      'body',
      [0, 0, -side * 0.2],
      'fur',
    ),
    s(
      'earInner' + n,
      'primary',
      [side * 0.12, 0.4, -0.08],
      [0.07, 0.18, 0.016],
      chevron,
      'body',
      [0, 0, -side * 0.2],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.083, 0.27, -0.198],
      [0.044, 0.04, 0.03],
      'body',
      undefined,
      'glass',
      true,
    ),
    v(
      'fang' + n,
      'ivory',
      [side * 0.041, 0.17, -0.231],
      [
        [0, 0, 0, 0.014],
        [0, -0.046, 0.005, 0.001],
      ],
      'body',
      [1, 1, 1],
      'stone',
    ),
    s(
      'wing' + n,
      'secondary',
      [side * 0.1, 0.06, 0.015],
      [1, 1, 0.025],
      [
        [0, 0],
        [side * 0.22, 0.27],
        [side * 0.7, 0.4],
        [side * 0.59, 0.18],
        [side * 0.64, -0.19],
        [side * 0.44, -0.08],
        [side * 0.34, -0.28],
        [side * 0.19, -0.17],
        [side * 0.04, -0.28],
      ],
      'body',
      [0, side * 0.15, 0],
      'fur',
    ),
    v(
      'leading' + n,
      'primary',
      [0, 0, -0.012],
      [
        [0, 0, 0, 0.033],
        [side * 0.22, 0.27, 0, 0.029],
        [side * 0.7, 0.4, 0, 0.008],
      ],
      'wing' + n,
    ),
    v(
      'thumb' + n,
      'ivory',
      [side * 0.22, 0.27, -0.005],
      [
        [0, 0, 0, 0.022],
        [side * 0.035, 0.08, 0, 0.013],
        [side * 0.07, 0.07, 0, 0.001],
      ],
      'wing' + n,
      [1, 1, 1],
      'stone',
    ),
    v(
      'foot' + n,
      'secondary',
      [side * 0.065, -0.16, 0],
      [
        [0, 0, 0, 0.035],
        [side * 0.04, -0.14, 0.035, 0.02],
        [side * 0.04, -0.2, -0.015, 0.004],
      ],
      'body',
    ),
  );
  for (let i = 0; i < 3; i++) {
    const tip = [
      [0.64, -0.19],
      [0.34, -0.28],
      [0.04, -0.28],
    ][i];
    parts.push(
      v(
        'rib' + n + i,
        'primary',
        [side * 0.22, 0.27, -0.018],
        [
          [0, 0, 0, 0.014],
          [side * (tip[0] - 0.22) * 0.6, (tip[1] - 0.27) * 0.55, 0, 0.011],
          [side * (tip[0] - 0.22), tip[1] - 0.27, 0, 0.002],
        ],
        'wing' + n,
      ),
    );
  }
}
export const clips = {
  attack: action('body', [-0.17, 0, 0], [0, 0, -0.04]),
  skill: {
    tracks: [
      ...action('body', [0.12, 0, 0], [0, 0.03, 0]).tracks,
      ...action('wingL', [0, -0.35, -0.2]).tracks,
      ...action('wingR', [0, 0.35, 0.2]).tracks,
    ],
  },
};
