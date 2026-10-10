import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'thorax',
    'secondary',
    [0, 1.03, -0.09],
    [
      [0, 0, -0.15, 0.07],
      [0, 0.02, 0, 0.16],
      [0, 0, 0.14, 0.08],
    ],
  ),
  v(
    'waist',
    'dark',
    [0, 0, 0.12],
    [
      [0, 0, 0, 0.065],
      [0, -0.035, 0.14, 0.055],
    ],
    'thorax',
  ),
  v(
    'abdomen',
    'primary',
    [0, -0.035, 0.24],
    [
      [0, 0, 0, 0.07],
      [0, -0.02, 0.13, 0.17],
      [0, -0.035, 0.31, 0.14],
      [0, -0.05, 0.46, 0.055],
    ],
    'thorax',
  ),
  v(
    'needle',
    'energy',
    [0, -0.05, 0.45],
    [
      [0, 0, 0, 0.045],
      [0, -0.02, 0.14, 0.023],
      [0, -0.02, 0.3, 0.001],
    ],
    'abdomen',
    [1, 1, 1],
    'stone',
  ),
  q('head', 'sphere', 'primary', [0, 0.005, -0.22], [0.28, 0.25, 0.24], 'thorax', undefined, 'fur'),
];
parts.find((p) => p.name === 'needle')!.emissive = true;
for (let i = 0; i < 3; i++)
  parts.push(
    q(
      'band' + i,
      'torus',
      'dark',
      [0, -0.01 - i * 0.013, 0.1 + i * 0.1],
      [i === 0 ? 0.26 : 0.28, i === 0 ? 0.26 : 0.28, 0.1],
      'abdomen',
    ),
  );
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'dark',
      [side * 0.105, 0.025, -0.07],
      [0.13, 0.17, 0.13],
      'head',
      undefined,
      'glass',
    ),
    q('glint' + n, 'sphere', 'ivory', [side * 0.12, 0.06, -0.13], [0.03, 0.035, 0.02], 'head'),
    v(
      'antenna' + n,
      'dark',
      [side * 0.07, 0.095, -0.02],
      [
        [0, 0, 0, 0.014],
        [side * 0.06, 0.12, -0.045, 0.012],
        [side * 0.07, 0.17, -0.13, 0.007],
      ],
      'head',
    ),
    v(
      'jaw' + n,
      'ivory',
      [side * 0.05, -0.075, -0.09],
      [
        [0, 0, 0, 0.023],
        [side * 0.035, -0.05, -0.03, 0.018],
        [0, -0.07, -0.06, 0.001],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
  );
  for (let i = 0; i < 2; i++) {
    const name = i === 0 ? 'wing' + n : 'hindwing' + n;
    parts.push(
      s(
        name,
        'ivory',
        [side * 0.07, 0.12, i * 0.17],
        [1, 1, 0.025],
        i === 0
          ? [
              [0, 0],
              [side * 0.22, 0.27],
              [side * 0.52, 0.39],
              [side * 0.67, 0.34],
              [side * 0.72, 0.22],
              [side * 0.62, 0.08],
              [side * 0.3, -0.035],
            ]
          : [
              [0, 0],
              [side * 0.28, 0.04],
              [side * 0.5, -0.06],
              [side * 0.54, -0.19],
              [side * 0.43, -0.28],
              [side * 0.2, -0.22],
            ],
        'thorax',
        [-Math.PI / 2, side * 0.2, 0],
        'glass',
      ),
      v(
        name + 'Vein',
        'primary',
        [0, 0, -0.018],
        [
          [0, 0, 0, 0.011],
          [side * 0.27, i === 0 ? 0.13 : -0.08, 0, 0.01],
          [side * (i === 0 ? 0.63 : 0.46), i === 0 ? 0.26 : -0.16, 0, 0.002],
        ],
        name,
      ),
    );
  }
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'leg' + n + i,
        'dark',
        [side * 0.11, -0.06, -0.1 + i * 0.12],
        [
          [0, 0, 0, 0.026],
          [side * 0.14, -0.13, 0.04, 0.022],
          [side * 0.12, -0.29, 0.09, 0.013],
          [side * 0.2, -0.33, 0.05, 0.002],
        ],
        'thorax',
      ),
    );
}
export const clips = {
  attack: action('abdomen', [0.3, 0, 0], [0, 0, 0.06]),
  skill: {
    tracks: [
      ...action('abdomen', [0.45, 0, 0], [0, 0, 0.07]).tracks,
      ...action('wingL', [0, -0.25, 0]).tracks,
      ...action('wingR', [0, 0.25, 0]).tracks,
    ],
  },
};
