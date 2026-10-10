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
// One-cost scout: compact mount and a seated crossbow rider, not a miniature high-cost eagle.
export const parts: ArtPart[] = [
  v(
    'bird',
    'primary',
    [0, 0.65, 0.05],
    [
      [0, -0.025, -0.25, 0.06],
      [0, 0.02, -0.06, 0.17],
      [0, 0, 0.19, 0.17],
      [0, -0.04, 0.32, 0.04],
    ],
  ),
  v(
    'neck',
    'primary',
    [0, 0.06, -0.2],
    [
      [0, 0, 0, 0.08],
      [0, 0.17, -0.1, 0.08],
    ],
    'bird',
  ),
  q('head', 'sphere', 'primary', [0, 0.18, -0.105], [0.2, 0.2, 0.22], 'neck', undefined, 'fur'),
  v(
    'beak',
    'accent',
    [0, -0.015, -0.105],
    [
      [0, 0, 0, 0.043],
      [0, -0.025, -0.11, 0.025],
      [0, -0.055, -0.13, 0.001],
    ],
    'head',
    [1, 1, 1],
    'stone',
  ),
  s('saddle', 'secondary', [0, 0.14, 0.04], [0.26, 0.11, 0.31], armour, 'bird', undefined, 'cloth'),
  s('rider', 'ivory', [0, 0.2, 0.055], [0.2, 0.24, 0.14], armour, 'saddle', undefined, 'cloth'),
  q(
    'riderHead',
    'sphere',
    'ivory',
    [0, 0.2, -0.025],
    [0.16, 0.18, 0.16],
    'rider',
    undefined,
    'fur',
  ),
  s('helmet', 'secondary', [0, 0.275, -0.015], [0.19, 0.095, 0.2], armour, 'rider'),
  s('visor', 'dark', [0, 0.2, -0.108], [0.115, 0.035, 0.012], armour, 'rider', undefined, 'fur'),
  v(
    'armR',
    'ivory',
    [0.115, 0.065, -0.015],
    [
      [0, 0, 0, 0.035],
      [0.055, -0.075, -0.055, 0.03],
      [0.03, -0.06, -0.16, 0.025],
    ],
    'rider',
  ),
  q('handR', 'sphere', 'ivory', [0.03, -0.06, -0.16], [0.07, 0.07, 0.07], 'armR', undefined, 'fur'),
  v(
    'armL',
    'ivory',
    [-0.115, 0.065, -0.015],
    [
      [0, 0, 0, 0.035],
      [-0.03, -0.1, -0.12, 0.03],
      [0.26, -0.06, -0.18, 0.025],
    ],
    'rider',
  ),
  s(
    'crossbow',
    'secondary',
    [0, 0, -0.08],
    [0.065, 0.065, 0.35],
    armour,
    'handR',
    undefined,
    'wood',
  ),
  v(
    'bow',
    'accent',
    [0, 0.025, -0.11],
    [
      [-0.19, 0, 0.04, 0.015],
      [-0.09, 0, -0.025, 0.017],
      [0, 0, -0.045, 0.018],
      [0.09, 0, -0.025, 0.017],
      [0.19, 0, 0.04, 0.015],
    ],
    'crossbow',
    [1, 1, 1],
    'wood',
  ),
  v(
    'string',
    'ivory',
    [0, 0.025, -0.07],
    [
      [-0.19, 0, 0, 0.003],
      [0, 0, 0.07, 0.003],
      [0.19, 0, 0, 0.003],
    ],
    'crossbow',
  ),
  q(
    'bolt',
    'cylinder',
    'energy',
    [0, 0.04, -0.06],
    [0.018, 0.33, 0.018],
    'crossbow',
    [Math.PI / 2, 0, 0],
    'steel',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'dark',
      [side * 0.071, 0.025, -0.087],
      [0.027, 0.03, 0.02],
      'head',
      undefined,
      'glass',
    ),
    v(
      'wing' + n,
      'secondary',
      [side * 0.115, 0.045, 0.025],
      [
        [0, 0, 0, 0.065],
        [side * 0.19, 0.025, 0.045, 0.07],
        [side * 0.4, -0.025, 0.13, 0.008],
      ],
      'bird',
      [1, 0.55, 1],
    ),
    v(
      'leg' + n,
      'accent',
      [side * 0.1, -0.13, 0.03],
      [
        [0, 0, 0, 0.035],
        [side * 0.04, -0.13, 0.065, 0.028],
        [side * 0.025, -0.33, -0.045, 0.02],
      ],
      'bird',
      [1, 1, 1],
      'stone',
    ),
    v(
      'riderLeg' + n,
      'secondary',
      [side * 0.085, 0.045, 0.04],
      [
        [0, 0, 0, 0.048],
        [side * 0.075, -0.11, -0.065, 0.043],
        [side * 0.065, -0.26, -0.015, 0.028],
      ],
      'saddle',
    ),
    s(
      'boot' + n,
      'dark',
      [side * 0.065, -0.26, -0.04],
      [0.075, 0.065, 0.12],
      armour,
      'riderLeg' + n,
      undefined,
      'cloth',
    ),
    v(
      'rein' + n,
      'secondary',
      [side * 0.055, 0.11, -0.15],
      [
        [0, 0, 0, 0.006],
        [side * 0.07, -0.015, -0.14, 0.006],
        [side * 0.035, -0.04, -0.26, 0.006],
      ],
      'bird',
    ),
  );
  for (let i = 0; i < 4; i++)
    parts.push(
      s(
        'feather' + n + i,
        i % 2 ? 'primary' : 'secondary',
        [side * (0.1 + i * 0.095), 0, 0.115 + i * 0.025],
        [0.12, 0.25, 0.024],
        feather,
        'wing' + n,
        [Math.PI / 2, 0, -side * 0.3],
        'fur',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'toe' + n + i,
        'dark',
        [side * 0.025 + (i - 1) * 0.028, -0.33, -0.045],
        [
          [0, 0, 0, 0.012],
          [0, -0.025, -0.07, 0.008],
          [0, 0.005, -0.1, 0.001],
        ],
        'leg' + n,
        [1, 1, 1],
        'stone',
      ),
    );
}
for (let i = 0; i < 3; i++)
  parts.push(
    s(
      'tail' + i,
      'secondary',
      [(i - 1) * 0.05, -0.02, 0.37],
      [0.1, 0.28, 0.025],
      feather,
      'bird',
      [Math.PI / 2, 0, -(i - 1) * 0.17],
      'fur',
    ),
  );
export const clips = {
  attack: action('rider', [-0.035, 0, 0], [0, 0, 0.035]),
  skill: {
    tracks: [
      ...action('rider', [-0.1, 0, 0], [0, 0, 0.04]).tracks,
      ...action('wingL', [0, -0.2, -0.15]).tracks,
      ...action('wingR', [0, 0.2, 0.15]).tracks,
    ],
  },
};
