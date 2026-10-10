import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
const feather: [number, number][] = [
  [-0.3, 0.5],
  [0.25, 0.5],
  [0.5, 0.12],
  [0.32, -0.25],
  [0, -0.5],
  [-0.28, -0.32],
  [-0.46, 0.02],
];
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 1.02, 0],
    [
      [0, -0.07, 0.28, 0.07],
      [0, 0, 0.1, 0.19],
      [0, 0.08, -0.1, 0.18],
      [0, 0.16, -0.25, 0.085],
    ],
  ),
  v(
    'breast',
    'ivory',
    [0, -0.04, -0.12],
    [
      [0, -0.09, 0.08, 0.1],
      [0, 0.03, -0.02, 0.13],
      [0, 0.14, -0.1, 0.06],
    ],
    'body',
    [1, 1, 0.6],
  ),
  q('head', 'sphere', 'ivory', [0, 0.2, -0.3], [0.27, 0.27, 0.3], 'body', undefined, 'fur'),
  v(
    'beak',
    'accent',
    [0, -0.02, -0.12],
    [
      [0, 0, 0, 0.055],
      [0, -0.015, -0.09, 0.043],
      [0, -0.09, -0.13, 0.001],
    ],
    'head',
    [1, 1, 1],
    'stone',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      'mask' + n,
      'secondary',
      [side * 0.105, 0.015, -0.045],
      [0.2, 0.067, 0.036],
      chevron,
      'head',
      [0, side * 0.7, 0],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.098, 0.04, -0.108],
      [0.04, 0.035, 0.025],
      'head',
      undefined,
      'glass',
      true,
    ),
    v(
      'wing' + n,
      'primary',
      [side * 0.12, 0.07, 0.03],
      [
        [0, 0, 0, 0.095],
        [side * 0.27, 0.08, -0.05, 0.105],
        [side * 0.54, 0.04, 0.025, 0.045],
        [side * 0.65, -0.02, 0.13, 0.006],
      ],
      'body',
      [1, 0.65, 1],
    ),
    v(
      'leg' + n,
      'accent',
      [side * 0.095, -0.12, 0.015],
      [
        [0, 0, 0, 0.035],
        [side * 0.04, -0.16, -0.04, 0.027],
        [side * 0.04, -0.24, -0.13, 0.019],
      ],
      'body',
      [1, 1, 1],
      'stone',
    ),
  );
  for (let i = 0; i < 6; i++)
    parts.push(
      s(
        'primary' + n + i,
        i % 2 ? 'secondary' : 'primary',
        [side * (0.17 + i * 0.084), 0.025, 0.095 + i * 0.026],
        [0.13, 0.34 + i * 0.018, 0.027],
        feather,
        'wing' + n,
        [Math.PI / 2, 0, -side * (0.16 + i * 0.09)],
        'fur',
      ),
    );
  for (let i = 0; i < 4; i++)
    parts.push(
      s(
        'covert' + n + i,
        'ivory',
        [side * (0.11 + i * 0.11), 0.07, 0.025],
        [0.15, 0.19, 0.033],
        feather,
        'wing' + n,
        [Math.PI / 2, 0, -side * 0.25],
        'fur',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'claw' + n + i,
        'dark',
        [side * 0.04 + (i - 1) * 0.04, -0.235, -0.12],
        [
          [0, 0, 0, 0.014],
          [0, -0.035, -0.07, 0.012],
          [0, 0.015, -0.11, 0.001],
        ],
        'leg' + n,
        [1, 1, 1],
        'stone',
      ),
    );
}
for (let i = 0; i < 5; i++)
  parts.push(
    s(
      'tail' + i,
      i % 2 ? 'ivory' : 'secondary',
      [(i - 2) * 0.055, -0.055, 0.38],
      [0.105, 0.36, 0.028],
      feather,
      'body',
      [Math.PI / 2, 0, -(i - 2) * 0.16],
      'fur',
    ),
  );
export const clips = {
  attack: {
    tracks: [...action('legL', [-0.4, 0, 0]).tracks, ...action('legR', [-0.4, 0, 0]).tracks],
  },
  skill: {
    tracks: [
      ...action('body', [-0.18, 0, 0], [0, -0.07, -0.12]).tracks,
      ...action('wingL', [0, -0.22, -0.15]).tracks,
      ...action('wingR', [0, 0.22, 0.15]).tracks,
    ],
  },
};
