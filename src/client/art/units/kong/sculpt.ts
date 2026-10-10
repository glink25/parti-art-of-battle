import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.62, 0], [0.29, 0.22, 0.22], armour, undefined, undefined, 'cloth'),
  v(
    'torso',
    'primary',
    [0, 0.19, 0],
    [
      [0, -0.07, 0, 0.14],
      [0, 0.12, 0, 0.22],
      [0, 0.22, 0, 0.14],
    ],
    'body',
    [1, 1, 0.65],
  ),
  s('chest', 'accent', [0, 0.1, -0.15], [0.32, 0.22, 0.055], chevron, 'torso', undefined, 'brass'),
  q('head', 'sphere', 'ivory', [0, 0.33, -0.015], [0.23, 0.25, 0.23], 'torso', undefined, 'fur'),
  s(
    'browBand',
    'accent',
    [0, 0.105, -0.015],
    [0.25, 0.055, 0.22],
    armour,
    'head',
    undefined,
    'brass',
  ),
  q(
    'halo',
    'torus',
    'energy',
    [0, 0.32, 0.15],
    [0.38, 0.38, 0.055],
    'torso',
    undefined,
    'glass',
    true,
  ),
  s(
    'loin',
    'primary',
    [0, -0.11, -0.135],
    [0.24, 0.24, 0.035],
    chevron,
    'body',
    undefined,
    'cloth',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.1, -0.08, 0],
      [side * 0.15, -0.23, 0],
      [side * 0.18, -0.39, -0.025],
      0.115,
      'body',
    ),
    s(
      'foot' + n,
      'dark',
      [0, -0.015, -0.04],
      [0.16, 0.1, 0.23],
      armour,
      'leg' + n + 'End',
      undefined,
      'cloth',
    ),
    ...limb(
      'arm' + n,
      [side * 0.23, 0.16, 0],
      [side * 0.31, -0.035, -0.015],
      [side * 0.27, -0.075, -0.2],
      0.12,
      'torso',
    ),
    s('fist' + n, 'primary', [0, 0, -0.035], [0.19, 0.2, 0.22], armour, 'arm' + n + 'End'),
    s(
      'cuff' + n,
      'accent',
      [0, 0.035, 0.045],
      [0.2, 0.09, 0.18],
      armour,
      'fist' + n,
      undefined,
      'brass',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'knuckle' + n + i,
        'sphere',
        'accent',
        [(i - 1) * 0.053, 0.015, -0.15],
        [0.045, 0.06, 0.035],
        'fist' + n,
        undefined,
        'brass',
      ),
    );
}
export const clips = {
  attack: action('armR', [-0.55, 0, -0.12]),
  skill: {
    tracks: [
      ...action('armL', [-0.35, 0, -0.25]).tracks,
      ...action('armR', [-0.35, 0, 0.25]).tracks,
      ...action('halo', [0, 0.5, 0], [0, 0.04, 0]).tracks,
    ],
  },
};

for (const side of [-1, 1])
  parts.push(
    q(
      'eye' + side,
      'sphere',
      'dark',
      [side * 0.055, 0.015, -0.118],
      [0.026, 0.023, 0.018],
      'head',
      undefined,
      'fur',
    ),
    s(
      'brow' + side,
      'secondary',
      [side * 0.055, 0.045, -0.112],
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
