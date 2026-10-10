import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s(
    'body',
    'secondary',
    [0, 0.81, 0.015],
    [0.33, 0.23, 0.27],
    armour,
    undefined,
    undefined,
    'cloth',
  ),
  v(
    'torso',
    'primary',
    [0, 0.22, 0],
    [
      [0, -0.1, 0, 0.15],
      [0, 0.08, 0, 0.23],
      [0, 0.24, 0, 0.16],
    ],
    'body',
    [1, 1, 0.65],
  ),
  s('breast', 'accent', [0, 0.1, -0.17], [0.3, 0.24, 0.04], chevron, 'torso', undefined, 'brass'),
  q('head', 'sphere', 'ivory', [0, 0.34, -0.04], [0.25, 0.28, 0.25], 'torso', undefined, 'fur'),
  v(
    'beak',
    'accent',
    [0, -0.035, -0.13],
    [
      [0, 0, 0, 0.045],
      [0, -0.02, -0.11, 0.032],
      [0, -0.08, -0.13, 0.001],
    ],
    'head',
    [1, 1, 1],
    'stone',
  ),
  s('crest', 'secondary', [0, 0.2, 0.025], [0.18, 0.3, 0.08], chevron, 'head', undefined, 'fur'),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.1, -0.07, 0],
      [side * 0.16, -0.32, 0.04],
      [side * 0.17, -0.59, -0.01],
      0.12,
      'body',
    ),
    s('foot' + n, 'dark', [0, -0.005, -0.05], [0.15, 0.1, 0.23], armour, 'leg' + n + 'End'),
    v(
      'wing' + n,
      'secondary',
      [side * 0.17, 0.15, 0.12],
      [
        [0, 0, 0, 0.075],
        [side * 0.22, 0.29, 0.03, 0.085],
        [side * 0.52, 0.42, 0.06, 0.015],
      ],
      'torso',
    ),
    ...limb(
      'arm' + n,
      [side * 0.25, 0.14, 0],
      [side * 0.34, -0.06, -0.04],
      [side * 0.28, -0.015, -0.29],
      0.115,
      'torso',
    ),
    q(
      'drum' + n,
      'cylinder',
      'secondary',
      [side * 0.31, 0.02, -0.24],
      [0.3, 0.15, 0.3],
      'body',
      [Math.PI / 2, 0, 0],
      'wood',
    ),
    q(
      'skin' + n,
      'cylinder',
      'ivory',
      [0, -0.08, 0],
      [0.265, 0.015, 0.265],
      'drum' + n,
      undefined,
      'cloth',
    ),
    q(
      'rim' + n,
      'torus',
      'accent',
      [0, -0.09, 0],
      [0.3, 0.3, 0.045],
      'drum' + n,
      [Math.PI / 2, 0, 0],
      'brass',
    ),
    q(
      'hammer' + n,
      'cylinder',
      'secondary',
      [0, 0.105, 0],
      [0.035, 0.3, 0.035],
      'arm' + n + 'End',
      undefined,
      'wood',
    ),
    q(
      'hammerHead' + n,
      'sphere',
      'energy',
      [0, 0.26, 0],
      [0.115, 0.12, 0.115],
      'hammer' + n,
      undefined,
      'glass',
      true,
    ),
  );
  for (let i = 0; i < 5; i++)
    parts.push(
      s(
        'feather' + n + i,
        i % 2 ? 'primary' : 'secondary',
        [side * (0.11 + i * 0.1), 0.03 + i * 0.025, 0.07],
        [0.13, 0.45, 0.03],
        [
          [-0.3, 0.5],
          [0.3, 0.5],
          [0.45, 0.05],
          [0, -0.5],
          [-0.4, -0.1],
        ],
        'wing' + n,
        [0, 0, side * 0.25],
        'fur',
      ),
    );
}
export const clips = {
  attack: action('armR', [-0.6, 0, 0]),
  skill: {
    tracks: [
      ...action('armR', [-0.7, 0, 0]).tracks,
      ...action('armL', [-0.7, 0, 0]).tracks,
      ...action('wingL', [0, -0.25, -0.12]).tracks,
      ...action('wingR', [0, 0.25, 0.12]).tracks,
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
