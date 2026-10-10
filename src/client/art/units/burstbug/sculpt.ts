import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'secondary',
    [0, 0.49, -0.13],
    [
      [0, 0, -0.14, 0.08],
      [0, 0.015, 0, 0.17],
      [0, 0, 0.18, 0.1],
    ],
  ),
  v(
    'abdomen',
    'energy',
    [0, 0.05, 0.27],
    [
      [0, 0, -0.12, 0.12],
      [0, 0.045, 0.035, 0.29],
      [0, 0.035, 0.25, 0.28],
      [0, -0.03, 0.39, 0.08],
    ],
    'body',
    [1, 0.95, 1],
    'glass',
  ),
  q('head', 'sphere', 'primary', [0, 0.005, -0.2], [0.27, 0.23, 0.25], 'body', undefined, 'fur'),
];
parts.find((p) => p.name === 'abdomen')!.emissive = true;
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'accent',
      [side * 0.084, 0.045, -0.11],
      [0.075, 0.065, 0.04],
      'head',
      undefined,
      'glass',
    ),
    v(
      'mandible' + n,
      'ivory',
      [side * 0.085, -0.06, -0.11],
      [
        [0, 0, 0, 0.027],
        [side * 0.025, -0.02, -0.065, 0.026],
        [-side * 0.055, 0, -0.11, 0.001],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
    v(
      'antenna' + n,
      'secondary',
      [side * 0.075, 0.08, -0.015],
      [
        [0, 0, 0, 0.017],
        [side * 0.04, 0.15, -0.045, 0.013],
        [side * 0.11, 0.2, -0.1, 0.006],
      ],
      'head',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'leg' + n + i,
        'secondary',
        [side * 0.13, -0.05, -0.08 + i * 0.12],
        [
          [0, 0, 0, 0.039],
          [side * 0.23, 0.035, (i - 1) * 0.13, 0.031],
          [side * 0.31, -0.24, (i - 1) * 0.2, 0.018],
          [side * 0.36, -0.27, (i - 1) * 0.22, 0.01],
        ],
        'body',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'rib' + n + i,
        'primary',
        [0, 0.08, -0.045 + i * 0.115],
        [
          [side * 0.045, 0.18, 0, 0.027],
          [side * 0.2, 0.12, 0, 0.031],
          [side * 0.27, -0.01, 0, 0.027],
          [side * 0.22, -0.17, 0, 0.01],
        ],
        'abdomen',
      ),
    );
}
for (let i = 0; i < 3; i++)
  parts.push(
    s(
      'backPlate' + i,
      'primary',
      [0, 0.265, 0.015 + i * 0.11],
      [0.18, 0.14, 0.045],
      chevron,
      'abdomen',
      [-Math.PI / 2, 0, 0],
      'stone',
    ),
  );
export const clips = {
  attack: action('head', [-0.1, 0, 0], [0, 0, -0.06]),
  skill: action('abdomen', [0.12, 0, 0], [0, 0.08, 0]),
};
