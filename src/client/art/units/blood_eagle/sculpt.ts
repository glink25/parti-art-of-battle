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
// Four-cost apex silhouette: raised blade-feather wings, crown and long forked train.
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 1.03, 0.015],
    [
      [0, -0.19, 0.23, 0.09],
      [0, -0.02, 0.09, 0.25],
      [0, 0.15, -0.1, 0.23],
      [0, 0.26, -0.2, 0.12],
    ],
  ),
  v(
    'breast',
    'secondary',
    [0, -0.02, -0.17],
    [
      [0, -0.14, 0.015, 0.13],
      [0, 0.06, -0.06, 0.18],
      [0, 0.2, -0.05, 0.08],
    ],
    'body',
    [1, 1, 0.65],
  ),
  q('head', 'sphere', 'primary', [0, 0.31, -0.25], [0.31, 0.31, 0.31], 'body', undefined, 'fur'),
  v(
    'beak',
    'dark',
    [0, -0.035, -0.13],
    [
      [0, 0, 0, 0.065],
      [0, -0.025, -0.1, 0.05],
      [0, -0.12, -0.14, 0.001],
    ],
    'head',
    [1, 1, 1],
    'stone',
  ),
  q(
    'heart',
    'octa',
    'energy',
    [0, 0.035, -0.3],
    [0.15, 0.21, 0.07],
    'body',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'wing' + n,
      'secondary',
      [side * 0.18, 0.12, 0.045],
      [
        [0, 0, 0, 0.1],
        [side * 0.34, 0.26, 0.03, 0.12],
        [side * 0.73, 0.33, 0.09, 0.07],
        [side * 0.94, 0.23, 0.19, 0.006],
      ],
      'body',
      [1, 0.75, 1],
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.1, 0.045, -0.122],
      [0.057, 0.04, 0.029],
      'head',
      undefined,
      'glass',
      true,
    ),
    s(
      'brow' + n,
      'dark',
      [side * 0.1, 0.085, -0.1],
      [0.17, 0.055, 0.04],
      chevron,
      'head',
      [0, 0, -side * 0.25],
      'fur',
    ),
    v(
      'leg' + n,
      'secondary',
      [side * 0.12, -0.15, -0.015],
      [
        [0, 0, 0, 0.054],
        [side * 0.04, -0.18, -0.05, 0.035],
        [side * 0.04, -0.27, -0.16, 0.025],
      ],
      'body',
    ),
  );
  for (let i = 0; i < 7; i++) {
    const a = 0.14 + i * 0.08,
      len = 0.5 + i * 0.024;
    parts.push(
      s(
        'blade' + n + i,
        i % 2 ? 'primary' : 'secondary',
        [
          side * (0.12 + i * 0.084 + (Math.sin(a) * len) / 2),
          0.16 + i * 0.016 - (Math.cos(a) * len) / 2,
          0.085 + i * 0.025,
        ],
        [0.16, len, 0.035],
        feather,
        'wing' + n,
        [0, 0, side * a],
        'fur',
      ),
    );
  }
  for (let i = 0; i < 5; i++)
    parts.push(
      s(
        'covert' + n + i,
        'primary',
        [side * (0.19 + i * 0.12), 0.24, 0.04],
        [0.16, 0.25, 0.04],
        chevron,
        'wing' + n,
        [0.3, 0, -side * 0.65],
        'fur',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'talon' + n + i,
        'ivory',
        [side * 0.04 + (i - 1) * 0.049, -0.27, -0.16],
        [
          [0, 0, 0, 0.02],
          [0, -0.035, -0.095, 0.014],
          [0, 0.03, -0.135, 0.001],
        ],
        'leg' + n,
        [1, 1, 1],
        'stone',
      ),
    );
  for (let i = 0; i < 2; i++)
    parts.push(
      s(
        'crown' + n + i,
        'secondary',
        [side * (0.08 + i * 0.075), 0.23 + i * 0.005, 0.01],
        [0.09, 0.3 - i * 0.035, 0.04],
        feather,
        'head',
        [0, 0, -side * 0.4],
        'fur',
      ),
    );
  parts.push(
    s(
      'train' + n,
      'primary',
      [side * 0.12, -0.2, 0.49],
      [0.17, 0.75, 0.035],
      feather,
      'body',
      [1.05, 0, -side * 0.24],
      'fur',
    ),
    s(
      'trainTip' + n,
      'secondary',
      [0, -0.24, -0.02],
      [0.125, 0.23, 0.025],
      feather,
      'train' + n,
      undefined,
      'fur',
    ),
  );
}
export const clips = {
  attack: {
    tracks: [
      ...action('legL', [-0.5, 0, 0]).tracks,
      ...action('legR', [-0.5, 0, 0]).tracks,
      ...action('head', [-0.15, 0, 0]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...action('wingL', [0, -0.25, -0.25]).tracks,
      ...action('wingR', [0, 0.25, 0.25]).tracks,
      ...action('heart', [0, 0.5, 0], [0, 0.04, -0.035]).tracks,
      ...action('trainL', [0.18, 0, -0.1]).tracks,
      ...action('trainR', [0.18, 0, 0.1]).tracks,
    ],
  },
};
