import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Empty rib cage and separated wing fingers; no solid torso hidden inside the skeleton.
export const parts: ArtPart[] = [
  v(
    'chest',
    'ivory',
    [0, 1.03, 0.015],
    [
      [0, 0, -0.23, 0.065],
      [0, 0.035, 0.03, 0.07],
      [0, 0, 0.33, 0.05],
    ],
    undefined,
    [1, 1, 1],
    'stone',
  ),
  v(
    'sternum',
    'primary',
    [0, -0.2, -0.14],
    [
      [0, 0, 0, 0.035],
      [0, -0.02, 0.34, 0.035],
    ],
    'chest',
    [1, 1, 1],
    'stone',
  ),
  v(
    'neck',
    'ivory',
    [0, 0.01, -0.22],
    [
      [0, 0, 0, 0.055],
      [0, 0.2, -0.09, 0.05],
      [0, 0.31, -0.23, 0.045],
    ],
    'chest',
    [1, 1, 1],
    'stone',
  ),
  v(
    'skull',
    'ivory',
    [0, 0.32, -0.24],
    [
      [0, 0.025, 0.035, 0.085],
      [0, 0.025, -0.09, 0.13],
      [0, -0.035, -0.24, 0.07],
    ],
    'neck',
    [1, 1, 1],
    'stone',
  ),
  s('snout', 'ivory', [0, -0.04, -0.23], [0.19, 0.1, 0.24], armour, 'skull', undefined, 'stone'),
  v(
    'jaw',
    'primary',
    [0, -0.13, -0.14],
    [
      [0, 0, 0.015, 0.064],
      [0, -0.025, -0.16, 0.06],
      [0, 0, -0.23, 0.025],
    ],
    'skull',
    [1, 0.5, 1],
    'stone',
  ),
  q(
    'soul',
    'octa',
    'energy',
    [0, -0.095, 0.025],
    [0.12, 0.17, 0.13],
    'chest',
    undefined,
    'glass',
    true,
  ),
  v(
    'tail',
    'ivory',
    [0, 0, 0.32],
    [
      [0, 0, 0, 0.046],
      [0.04, -0.06, 0.23, 0.04],
      [0.17, -0.12, 0.43, 0.028],
      [0.25, -0.09, 0.63, 0.012],
      [0.24, 0.015, 0.75, 0.001],
    ],
    'chest',
    [1, 1, 1],
    'stone',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  for (let i = 0; i < 4; i++)
    parts.push(
      v(
        'rib' + n + i,
        'ivory',
        [0, 0, -0.15 + i * 0.13],
        [
          [0, 0, 0, 0.028],
          [side * (0.18 - i * 0.014), -0.015, 0, 0.027],
          [side * (0.2 - i * 0.014), -0.16, 0.015, 0.023],
          [side * 0.04, -0.22, 0.02, 0.012],
        ],
        'chest',
        [1, 1, 1],
        'stone',
      ),
    );
  parts.push(
    q(
      'socket' + n,
      'sphere',
      'dark',
      [side * 0.084, 0.04, -0.16],
      [0.1, 0.09, 0.05],
      'skull',
      undefined,
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.086, 0.04, -0.189],
      [0.043, 0.04, 0.018],
      'skull',
      undefined,
      'glass',
      true,
    ),
    v(
      'horn' + n,
      'primary',
      [side * 0.09, 0.115, 0.025],
      [
        [0, 0, 0, 0.032],
        [side * 0.065, 0.14, 0.055, 0.025],
        [side * 0.09, 0.22, 0.16, 0.001],
      ],
      'skull',
      [1, 1, 1],
      'stone',
    ),
    v(
      'wing' + n,
      'ivory',
      [side * 0.12, 0.03, 0.045],
      [
        [0, 0, 0, 0.044],
        [side * 0.25, 0.22, 0.015, 0.041],
        [side * 0.58, 0.35, 0.025, 0.028],
        [side * 0.8, 0.29, 0.05, 0.002],
      ],
      'chest',
      [1, 1, 1],
      'stone',
    ),
    s(
      'remnant' + n,
      'secondary',
      [side * 0.28, 0.2, 0.035],
      [1, 1, 0.018],
      [
        [0, 0],
        [side * 0.28, 0.08],
        [side * 0.24, -0.06],
        [side * 0.17, -0.015],
        [side * 0.12, -0.22],
        [side * 0.06, -0.12],
        [-side * 0.03, -0.29],
      ],
      'wing' + n,
      undefined,
      'cloth',
    ),
    v(
      'leg' + n,
      'ivory',
      [side * 0.13, -0.06, 0.23],
      [
        [0, 0, 0, 0.045],
        [side * 0.12, -0.19, 0.1, 0.04],
        [side * 0.09, -0.34, -0.035, 0.03],
      ],
      'chest',
      [1, 1, 1],
      'stone',
    ),
  );
  for (let i = 0; i < 3; i++) {
    parts.push(
      v(
        'finger' + n + i,
        'ivory',
        [side * 0.28, 0.23, 0.02],
        [
          [0, 0, 0, 0.024],
          [side * (0.13 + i * 0.14), -0.06, 0.025, 0.02],
          [side * (0.04 + i * 0.18), -0.38 - i * 0.055, 0.09, 0.009],
        ],
        'wing' + n,
        [1, 1, 1],
        'stone',
      ),
      v(
        'claw' + n + i,
        'ivory',
        [(i - 1) * 0.045 + side * 0.09, -0.34, -0.035],
        [
          [0, 0, 0, 0.017],
          [0, -0.045, -0.08, 0.012],
          [0, -0.02, -0.13, 0.001],
        ],
        'leg' + n,
        [1, 1, 1],
        'stone',
      ),
      v(
        'tooth' + n + i,
        'ivory',
        [side * 0.065, -0.065, -0.16 - i * 0.057],
        [
          [0, 0, 0, 0.016],
          [0, -0.07, 0.015, 0.001],
        ],
        'skull',
        [1, 1, 1],
        'stone',
      ),
    );
  }
}
for (let i = 0; i < 5; i++)
  parts.push(
    s(
      'vertebra' + i,
      'primary',
      [0, 0.035, -0.16 + i * 0.11],
      [0.14, 0.09, 0.085],
      armour,
      'chest',
      undefined,
      'stone',
    ),
  );
// A nested nasal plate preserves explicit skull → snout → nostril articulation.
parts.push(
  s('nasal', 'dark', [0, 0.06, -0.07], [0.07, 0.03, 0.04], chevron, 'snout', undefined, 'stone'),
);
export const clips = {
  attack: {
    tracks: [...action('neck', [-0.22, 0, 0]).tracks, ...action('jaw', [-0.4, 0, 0]).tracks],
  },
  skill: {
    tracks: [
      ...action('wingL', [0, -0.2, -0.22]).tracks,
      ...action('wingR', [0, 0.2, 0.22]).tracks,
      ...action('soul', [0, 0.5, 0], [0, 0.04, -0.035]).tracks,
      ...action('jaw', [-0.45, 0, 0]).tracks,
    ],
  },
};
