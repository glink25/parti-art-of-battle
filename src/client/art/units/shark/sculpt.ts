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
// Four-cost summoner: heavy shark anatomy with a tall dorsal fin and suspended talismans.
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 0.93, -0.035],
    [
      [0, 0, -0.76, 0.035],
      [0, 0.01, -0.55, 0.23],
      [0, 0.035, -0.23, 0.35],
      [0, 0, 0.16, 0.3],
      [0, -0.015, 0.5, 0.12],
    ],
    undefined,
    [1, 0.8, 1],
  ),
  v(
    'belly',
    'ivory',
    [0, -0.19, -0.23],
    [
      [0, 0, -0.32, 0.11],
      [0, -0.015, -0.06, 0.25],
      [0, 0.035, 0.25, 0.18],
      [0, 0.075, 0.52, 0.055],
    ],
    'body',
    [1, 0.35, 1],
  ),
  v(
    'jaw',
    'secondary',
    [0, -0.11, -0.49],
    [
      [-0.19, 0, 0.035, 0.018],
      [0, -0.065, -0.14, 0.025],
      [0.19, 0, 0.035, 0.018],
    ],
    'body',
  ),
  s('mouth', 'dark', [0, -0.125, -0.64], [0.28, 0.1, 0.035], armour, 'body', undefined, 'fur'),
  s(
    'dorsal',
    'secondary',
    [0, 0.41, -0.04],
    [0.49, 0.58, 0.07],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.12, 0.5],
      [-0.1, 0.28],
      [-0.22, -0.05],
    ],
    'body',
    [0, Math.PI / 2, 0],
    'fur',
  ),
  v(
    'tail',
    'primary',
    [0, -0.015, 0.48],
    [
      [0, 0, 0, 0.12],
      [0, 0.015, 0.24, 0.075],
      [0, 0.03, 0.39, 0.05],
    ],
    'body',
  ),
  s(
    'tailFin',
    'secondary',
    [0, 0.07, 0.43],
    [0.51, 0.67, 0.045],
    [
      [-0.5, 0],
      [-0.25, 0.25],
      [0.22, 0.5],
      [0.1, 0.04],
      [0.5, -0.39],
      [0.18, -0.31],
      [-0.16, -0.12],
    ],
    'tail',
    [0, Math.PI / 2, 0],
    'fur',
  ),
  q('sigil', 'torus', 'accent', [0, 0.23, 0.28], [0.44, 0.44, 0.07], 'body', undefined, 'brass'),
  q(
    'summonCore',
    'octa',
    'energy',
    [0, 0.48, 0.27],
    [0.115, 0.17, 0.09],
    'body',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      'fin' + n,
      'secondary',
      [side * 0.22, -0.085, -0.17],
      [1, 1, 0.045],
      [
        [0, 0],
        [side * 0.18, -0.03],
        [side * 0.64, -0.44],
        [side * 0.29, -0.32],
        [side * 0.04, -0.2],
        [-side * 0.04, -0.08],
      ],
      'body',
      [0.35, 0, 0],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'dark',
      [side * 0.22, 0.055, -0.545],
      [0.062, 0.048, 0.04],
      'body',
      undefined,
      'glass',
    ),
    q(
      'glint' + n,
      'sphere',
      'energy',
      [side * 0.23, 0.07, -0.565],
      [0.022, 0.02, 0.014],
      'body',
      undefined,
      'glass',
      true,
    ),
    s(
      'mask' + n,
      'ivory',
      [side * 0.27, 0.025, -0.365],
      [0.22, 0.25, 0.04],
      chevron,
      'body',
      [0, side * 1.2, 0],
      'stone',
    ),
    s(
      'talisman' + n,
      'ivory',
      [side * 0.22, -0.01, 0.26],
      [0.14, 0.23, 0.04],
      armour,
      'body',
      [0, side * 0.3, side * 0.15],
      'stone',
    ),
    s(
      'seal' + n,
      'energy',
      [0, 0, -0.025],
      [0.075, 0.13, 0.02],
      chevron,
      'talisman' + n,
      undefined,
      'glass',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'gill' + n + i,
        'secondary',
        [side * (0.325 - i * 0.006), 0.06, -0.23 + i * 0.085],
        [
          [0, 0.04, 0, 0.009],
          [side * 0.006, -0.07, -0.02, 0.012],
          [-side * 0.035, -0.16, -0.025, 0.003],
        ],
        'body',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      v(
        'tooth' + n + i,
        'ivory',
        [side * (0.045 + i * 0.044), -0.095, -0.661 + i * 0.011],
        [
          [0, 0, 0, 0.016],
          [0, -0.06, 0.006, 0.001],
        ],
        'body',
        [1, 1, 1],
        'stone',
      ),
    );
}
export const clips = {
  attack: action('body', [0.11, 0, 0], [0, 0, -0.085]),
  skill: {
    tracks: [
      ...action('sigil', [0, 0, 0.55], [0, 0.05, 0]).tracks,
      ...action('summonCore', [0, 0.65, 0], [0, 0.07, 0]).tracks,
      ...action('talismanL', [0, -0.25, -0.15], [0, 0.04, 0]).tracks,
      ...action('talismanR', [0, 0.25, 0.15], [0, 0.04, 0]).tracks,
      ...action('tail', [0, 0.23, 0]).tracks,
    ],
  },
};
