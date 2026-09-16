import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 0.87, 0.13],
    [
      [0, 0, -0.3, 0.1],
      [0, 0, -0.12, 0.2],
      [0, -0.035, 0.16, 0.22],
      [0, -0.02, 0.37, 0.14],
      [0, 0, 0.43, 0.025],
    ],
    undefined,
    [0.85, 1, 1],
  ),
  v(
    'neck',
    'primary',
    [0, 0.01, -0.27],
    [
      [0, -0.05, 0.05, 0.12],
      [0, 0.15, -0.04, 0.13],
      [0, 0.34, -0.14, 0.083],
    ],
    'body',
  ),
  v(
    'bib',
    'ivory',
    [0, 0.02, -0.36],
    [
      [0, 0, 0, 0.09],
      [0, 0.12, -0.035, 0.075],
      [0, 0.23, -0.07, 0.025],
    ],
    'body',
    [1, 0.95, 0.4],
  ),
  v(
    'head',
    'primary',
    [0, 0.35, -0.15],
    [
      [0, 0, 0.055, 0.1],
      [0, 0.005, -0.07, 0.11],
      [0, -0.04, -0.23, 0.055],
    ],
    'neck',
  ),
  q('nose', 'sphere', 'dark', [0, -0.045, -0.245], [0.09, 0.08, 0.07], 'head', undefined, 'fur'),
  v(
    'tail',
    'ivory',
    [0, 0.005, 0.39],
    [
      [0, 0, 0, 0.065],
      [0, 0.07, 0.12, 0.07],
      [0, 0.11, 0.16, 0.005],
    ],
    'body',
    [1, 0.65, 1],
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      'ear' + n,
      'primary',
      [side * 0.14, 0.11, 0.01],
      [0.22, 0.15, 0.06],
      [
        [-0.5, 0],
        [0, 0.5],
        [0.5, 0.15],
        [0.3, -0.35],
        [0, -0.5],
      ],
      'head',
      [0, 0, side * 0.4],
      'fur',
    ),
    s(
      'earInner' + n,
      'ivory',
      [side * 0.14, 0.11, -0.027],
      [0.15, 0.08, 0.015],
      chevron,
      'head',
      [0, 0, side * 0.4],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'dark',
      [side * 0.093, 0.025, -0.09],
      [0.04, 0.048, 0.03],
      'head',
      undefined,
      'glass',
    ),
    q(
      'eyeGlint' + n,
      'sphere',
      'ivory',
      [side * 0.095, 0.037, -0.107],
      [0.014, 0.014, 0.012],
      'head',
    ),
    v(
      'antler' + n,
      'ivory',
      [side * 0.075, 0.075, 0.025],
      [
        [0, 0, 0, 0.035],
        [side * 0.055, 0.15, 0.045, 0.03],
        [side * 0.15, 0.31, 0.07, 0.024],
        [side * 0.23, 0.42, 0.15, 0.008],
      ],
      'head',
      [1, 1, 1],
      'wood',
    ),
    v(
      'tine' + n + 'A',
      'ivory',
      [side * 0.11, 0.21, 0.065],
      [
        [0, 0, 0, 0.025],
        [-side * 0.025, 0.15, -0.07, 0.017],
        [-side * 0.01, 0.25, -0.1, 0.002],
      ],
      'head',
      [1, 1, 1],
      'wood',
    ),
    v(
      'tine' + n + 'B',
      'ivory',
      [side * 0.2, 0.35, 0.08],
      [
        [0, 0, 0, 0.022],
        [side * 0.025, 0.16, -0.06, 0.013],
        [side * 0.08, 0.22, -0.08, 0.002],
      ],
      'head',
      [1, 1, 1],
      'wood',
    ),
  );
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n;
    parts.push(
      v(
        leg,
        'primary',
        [side * 0.12, -0.1, fore ? -0.21 : 0.29],
        [
          [0, 0, 0, 0.07],
          [side * 0.025, -0.19, fore ? 0.01 : -0.05, 0.052],
          [side * 0.015, -0.39, fore ? 0 : 0.06, 0.029],
          [side * 0.025, -0.55, 0, 0.028],
        ],
        'body',
      ),
      s(
        leg + 'Hoof',
        'dark',
        [side * 0.025, -0.57, -0.015],
        [0.085, 0.08, 0.12],
        armour,
        leg,
        undefined,
        'fur',
      ),
      q(
        leg + 'Split',
        'roundedBox',
        'dark',
        [side * 0.025, -0.575, -0.078],
        [0.008, 0.055, 0.01],
        leg,
        undefined,
        'fur',
      ),
    );
  }
  for (let i = 0; i < 4; i++)
    parts.push(
      q(
        'spot' + n + i,
        'sphere',
        'ivory',
        [side * (0.17 - i * 0.007), 0.045, (i - 1) * 0.13],
        [0.027, 0.06, 0.045],
        'body',
        undefined,
        'fur',
      ),
    );
}
parts.push(
  q(
    'flower',
    'sphere',
    'energy',
    [0.2, 0.47, 0.08],
    [0.07, 0.07, 0.045],
    'head',
    undefined,
    'glass',
    true,
  ),
);
for (let i = 0; i < 5; i++) {
  const a = (i * Math.PI * 2) / 5;
  parts.push(
    q(
      'petal' + i,
      'sphere',
      'secondary',
      [0.2 + Math.cos(a) * 0.055, 0.47 + Math.sin(a) * 0.055, 0.09],
      [0.07, 0.06, 0.03],
      'head',
      undefined,
      'fur',
    ),
  );
}
export const clips = {
  attack: action('neck', [-0.18, 0, 0]),
  skill: action('head', [0.1, 0.18, 0], [0, 0.025, 0]),
};
