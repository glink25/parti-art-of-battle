import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.76, 0], [0.29, 0.23, 0.21], armour, undefined, undefined, 'cloth'),
  s('torso', 'primary', [0, 0.2, 0], [0.32, 0.37, 0.24], armour, 'body', undefined, 'cloth'),
  s(
    'lapel',
    'ivory',
    [-0.04, 0.055, -0.14],
    [0.055, 0.34, 0.024],
    armour,
    'torso',
    [0, 0, -0.32],
    'cloth',
  ),
  s('belt', 'accent', [0, 0.005, -0.13], [0.3, 0.065, 0.025], armour, 'body', undefined, 'cloth'),
  q('head', 'sphere', 'ivory', [0, 0.33, -0.025], [0.23, 0.26, 0.22], 'torso', undefined, 'fur'),
  s(
    'hat',
    'secondary',
    [0, 0.19, 0.02],
    [0.23, 0.25, 0.2],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.4, 0.5],
      [-0.4, 0.5],
    ],
    'head',
    undefined,
    'cloth',
  ),
  s('hatSeal', 'accent', [0, 0.19, -0.092], [0.08, 0.13, 0.015], chevron, 'head'),
  v(
    'beard',
    'ivory',
    [0, -0.095, -0.08],
    [
      [0, 0, 0, 0.064],
      [0, -0.16, 0.03, 0.055],
      [0, -0.27, 0.065, 0.003],
    ],
    'head',
    [1, 1, 0.45],
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.08, -0.07, 0],
      [side * 0.09, -0.28, 0],
      [side * 0.1, -0.54, 0],
      0.09,
      'body',
    ),
    s(
      'foot' + n,
      'dark',
      [0, -0.005, -0.04],
      [0.13, 0.1, 0.21],
      armour,
      'leg' + n + 'End',
      undefined,
      'cloth',
    ),
    s(
      'robe' + n,
      'primary',
      [side * 0.1, -0.24, 0.01],
      [0.25, 0.57, 0.24],
      [
        [-0.3, 0.5],
        [0.3, 0.5],
        [0.5, -0.5],
        [-0.5, -0.5],
      ],
      'body',
      [0, 0, -side * 0.1],
      'cloth',
    ),
    s(
      'hem' + n,
      'accent',
      [side * 0.11, -0.475, -0.12],
      [0.22, 0.04, 0.02],
      armour,
      'body',
      undefined,
      'cloth',
    ),
    ...limb(
      'arm' + n,
      [side * 0.2, 0.1, 0],
      [side * 0.3, -0.05, 0],
      [side * 0.32, -0.015, -0.17],
      0.09,
      'torso',
    ),
    s(
      'sleeve' + n,
      'primary',
      [0, -0.07, 0],
      [0.19, 0.24, 0.21],
      armour,
      'arm' + n,
      undefined,
      'cloth',
    ),
  );
}
parts.push(
  q(
    'staff',
    'cylinder',
    'secondary',
    [0, 0.1, 0],
    [0.045, 1.04, 0.045],
    'armREnd',
    undefined,
    'wood',
  ),
  s(
    'fork',
    'accent',
    [0, 0.59, 0],
    [0.24, 0.24, 0.06],
    [
      [-0.5, 0.5],
      [-0.25, 0.5],
      [-0.2, -0.1],
      [0.2, -0.1],
      [0.25, 0.5],
      [0.5, 0.5],
      [0.35, -0.5],
      [-0.35, -0.5],
    ],
    'staff',
    undefined,
    'brass',
  ),
  q(
    'thunder',
    'octa',
    'energy',
    [0, 0.67, 0],
    [0.11, 0.19, 0.1],
    'staff',
    undefined,
    'glass',
    true,
  ),
  s(
    'talisman',
    'ivory',
    [0, -0.08, -0.035],
    [0.12, 0.28, 0.02],
    chevron,
    'armLEnd',
    undefined,
    'cloth',
  ),
);
for (let i = 0; i < 3; i++)
  parts.push(
    s(
      'rune' + i,
      'secondary',
      [0, 0.01 - i * 0.055, -0.05],
      [0.07, 0.025, 0.01],
      chevron,
      'armLEnd',
    ),
  );
export const clips = {
  attack: action('armR', [-0.24, 0, 0]),
  skill: {
    tracks: [
      ...action('armR', [-0.32, 0, 0.13]).tracks,
      ...action('armL', [-0.55, 0, -0.12]).tracks,
    ],
  },
};

for (const side of [-1, 1])
  parts.push(
    q(
      'eye' + side,
      'sphere',
      'dark',
      [side * 0.055, 0.025, -0.108],
      [0.026, 0.023, 0.018],
      'head',
      undefined,
      'fur',
    ),
    s(
      'brow' + side,
      'secondary',
      [side * 0.055, 0.052, -0.102],
      [0.065, 0.018, 0.016],
      armour,
      'head',
      undefined,
      'fur',
    ),
  );
parts.push(
  q('nose', 'sphere', 'ivory', [0, -0.005, -0.127], [0.04, 0.05, 0.045], 'head', undefined, 'fur'),
);
