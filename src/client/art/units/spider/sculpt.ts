import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'secondary',
    [0, 0.53, -0.095],
    [
      [0, 0, -0.2, 0.1],
      [0, 0.015, -0.04, 0.18],
      [0, 0, 0.15, 0.11],
    ],
  ),
  v(
    'abdomen',
    'primary',
    [0, 0.065, 0.26],
    [
      [0, 0, -0.12, 0.12],
      [0, 0.045, 0.09, 0.28],
      [0, 0.025, 0.29, 0.25],
      [0, -0.06, 0.42, 0.09],
    ],
    'body',
    [1, 1, 1],
  ),
  q(
    'head',
    'sphere',
    'secondary',
    [0, 0.015, -0.225],
    [0.31, 0.24, 0.24],
    'body',
    undefined,
    'fur',
  ),
  v(
    'spinner',
    'energy',
    [0, -0.06, 0.39],
    [
      [0, 0, 0, 0.065],
      [0, -0.02, 0.12, 0.04],
      [0, -0.015, 0.17, 0.02],
    ],
    'abdomen',
    [1, 1, 1],
    'glass',
  ),
];
parts.find((p) => p.name === 'spinner')!.emissive = true;
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  for (let i = 0; i < 4; i++) {
    const dz = (i - 1.5) * 0.17;
    parts.push(
      v(
        'leg' + n + i,
        'secondary',
        [side * 0.12, -0.01, -0.1 + i * 0.075],
        [
          [0, 0, 0, 0.035],
          [side * 0.32, 0.14, dz, 0.035],
          [side * 0.46, -0.18, dz * 1.7, 0.023],
          [side * 0.49, -0.35, dz * 1.9, 0.01],
        ],
        'body',
      ),
    );
    parts.push(
      s(
        'legCuff' + n + i,
        'primary',
        [side * 0.31, 0.13, dz],
        [0.07, 0.12, 0.1],
        armour,
        'leg' + n + i,
        [0, 0, -side * 0.5],
        'stone',
      ),
    );
  }
  parts.push(
    v(
      'fang' + n,
      'ivory',
      [side * 0.07, -0.045, -0.095],
      [
        [0, 0, 0, 0.033],
        [side * 0.025, -0.09, -0.055, 0.026],
        [-side * 0.025, -0.12, -0.1, 0.001],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
    v(
      'palp' + n,
      'secondary',
      [side * 0.13, -0.015, -0.025],
      [
        [0, 0, 0, 0.028],
        [side * 0.07, -0.035, -0.13, 0.024],
        [side * 0.03, -0.06, -0.18, 0.009],
      ],
      'head',
    ),
  );
  for (let i = 0; i < 4; i++)
    parts.push(
      q(
        'eye' + n + i,
        'sphere',
        'energy',
        [side * (0.035 + i * 0.028), 0.055 + (i % 2) * 0.04, -0.12 + i * 0.012],
        [i < 2 ? 0.045 : 0.03, i < 2 ? 0.045 : 0.03, 0.027],
        'head',
        undefined,
        'glass',
        true,
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      s(
        'mark' + n + i,
        'secondary',
        [side * 0.12, 0.24 - i * 0.007, 0.03 + i * 0.1],
        [0.12, 0.13, 0.025],
        chevron,
        'abdomen',
        [-Math.PI / 2, side * 0.4, 0],
        'fur',
      ),
    );
}
export const clips = {
  attack: action('head', [-0.15, 0, 0], [0, 0, -0.035]),
  skill: action('abdomen', [0.18, 0, 0], [0, 0.035, 0]),
};
