import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  q('root', 'sphere', 'dark', [0, 0, 0], [0.001, 0.001, 0.001]),
  v(
    'body',
    'ivory',
    [0, 0.97, 0],
    [
      [0, -0.22, 0, 0.15],
      [0, 0, 0, 0.18],
      [0, 0.23, 0, 0.17],
    ],
    undefined,
    [1, 1, 0.72],
    'cloth',
  ),
  s(
    'collar',
    'primary',
    [0, 1.12, -0.14],
    [0.26, 0.25, 0.025],
    chevron,
    undefined,
    undefined,
    'cloth',
  ),
  s('belt', 'primary', [0, 0.81, -0.1], [0.34, 0.09, 0.12], armour, undefined, undefined, 'cloth'),
  ...limb('armL', [-0.18, 1.13, 0], [-0.36, 1.04, -0.04], [-0.49, 1.18, -0.12], 0.12, 'root'),
  ...limb('armR', [0.18, 1.13, 0], [0.31, 0.96, -0.08], [0.36, 0.91, -0.23], 0.12, 'root'),

  q('head', 'sphere', 'ivory', [0, 1.4, -0.025], [0.27, 0.33, 0.25], undefined, undefined, 'fur'),
  q(
    'nose',
    'sphere',
    'ivory',
    [0, -0.015, -0.137],
    [0.048, 0.063, 0.052],
    'head',
    undefined,
    'fur',
  ),
  q(
    'mouth',
    'roundedBox',
    'secondary',
    [0, -0.085, -0.125],
    [0.065, 0.012, 0.01],
    'head',
    undefined,
    'fur',
  ),
  q('hairCap', 'sphere', 'dark', [0, 0.075, 0.04], [0.3, 0.26, 0.26], 'head', undefined, 'fur'),

  v(
    'hairBack',
    'dark',
    [0, 0.02, 0.1],
    [
      [0, 0.07, 0, 0.12],
      [0, -0.12, 0.03, 0.14],
      [0, -0.43, 0.07, 0.095],
      [0.03, -0.55, 0.1, 0.005],
    ],
    'head',
    [1, 1, 0.65],
  ),
  q('daggerGrip', 'cylinder', 'secondary', [0, 0, 0], [0.05, 0.16, 0.05], 'armREnd'),
  q('daggerGuard', 'roundedBox', 'accent', [0, 0.1, 0], [0.15, 0.035, 0.07], 'daggerGrip'),
  s(
    'dagger',
    'ivory',
    [0, 0.12, 0],
    [0.09, 0.32, 0.025],
    [
      [-0.5, 0],
      [0.5, 0],
      [0.35, 0.6],
      [0, 1],
      [-0.4, 0.6],
    ],
    'daggerGrip',
  ),
  v(
    'hawk',
    'secondary',
    [-0.53, 1.33, -0.1],
    [
      [0, -0.08, 0.1, 0.065],
      [0, 0, 0, 0.11],
      [0, 0.1, -0.09, 0.06],
    ],
    undefined,
    [1, 1, 1],
  ),
  q('hawkHead', 'sphere', 'ivory', [0, 0.1, -0.09], [0.14, 0.14, 0.15], 'hawk', undefined, 'fur'),
  v(
    'beak',
    'accent',
    [0, 0.1, -0.15],
    [
      [0, 0, 0, 0.037],
      [0, -0.02, -0.055, 0.024],
      [0, -0.055, -0.07, 0.003],
    ],
    'hawk',
  ),
  q('hawkEye', 'sphere', 'dark', [-0.06, 0.125, -0.12], [0.025, 0.025, 0.025], 'hawk'),
  q(
    'hawkCharm',
    'sphere',
    'energy',
    [0, 0, -0.1],
    [0.06, 0.07, 0.025],
    'hawk',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'roundedBox',
      'dark',
      [side * 0.061, 0.023, -0.139],
      [0.043, 0.026, 0.012],
      'head',
      undefined,
      'fur',
    ),
    v(
      'brow' + n,
      'secondary',
      [side * 0.06, 0.058, -0.14],
      [
        [-0.025, 0, 0, 0.007],
        [0, 0.006, 0, 0.009],
        [0.025, 0, 0, 0.005],
      ],
      'head',
    ),
  );
}

for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.1, 0.77, 0],
      [side * 0.12, 0.5, 0],
      [side * 0.16, 0.25, 0],
      0.13,
      'root',
    ),
    q(
      'foot' + n,
      'roundedBox',
      'secondary',
      [side * 0.16, 0.22, -0.06],
      [0.18, 0.12, 0.27],
      undefined,
      undefined,
      'cloth',
    ),
    s(
      'tunic' + n,
      'ivory',
      [side * 0.1, 0.66, 0],
      [0.25, 0.33, 0.24],
      chevron,
      undefined,
      [0, 0, side * 0.1],
      'cloth',
    ),
    s(
      'hem' + n,
      'primary',
      [side * 0.11, 0.52, -0.13],
      [0.22, 0.065, 0.03],
      chevron,
      undefined,
      undefined,
      'cloth',
    ),
    q(
      'hand' + n,
      'sphere',
      'ivory',
      [0, 0, 0],
      [0.11, 0.13, 0.11],
      'arm' + n + 'End',
      undefined,
      'fur',
    ),
    s(
      'bow' + n,
      'primary',
      [side * 0.12, 0.2, 0.03],
      [0.25, 0.22, 0.065],
      [
        [0, 0],
        [-0.4, -0.5],
        [-0.5, 0.5],
        [0.25, 0.26],
      ],
      'head',
      [0, 0, side * 0.4],
      'cloth',
    ),
    v(
      'wing' + n,
      'secondary',
      [side * 0.07, 0.02, 0.015],
      [
        [0, 0, 0, 0.065],
        [side * 0.14, 0.1, 0.02, 0.07],
        [side * 0.3, 0.13, 0.04, 0.025],
      ],
      'hawk',
      [1, 1, 0.6],
    ),
  );
  for (let i = 0; i < 5; i++)
    parts.push(
      s(
        'feather' + n + i,
        'secondary',
        [side * (0.09 + i * 0.05), 0.01 + i * 0.025, 0.035],
        [0.075, 0.26 - i * 0.018, 0.025],
        [
          [0, 0.5],
          [-0.45, 0.25],
          [-0.3, -0.35],
          [0, -0.5],
          [0.4, 0.15],
        ],
        'hawk',
        [0.55, 0, -side * 0.6],
        'fur',
      ),
    );
}

// Preserve the joint chain, but give cloth and skin curved volume instead of armor plates.
for (const part of parts) {
  if (/^(arm|leg)[LR](Upper|Lower)$/.test(part.name)) {
    delete part.profile;
    part.primitive = 'muscle';
    part.surface = 'cloth';
  }
  if (/^arm[LR](End|Elbow)?$/.test(part.name)) {
    part.primitive = 'sphere';
    part.color = part.name.endsWith('End') ? 'ivory' : 'primary';
    part.surface = 'cloth';
  }
  if (/^leg[LR]Elbow$/.test(part.name)) {
    part.color = 'primary';
    part.surface = 'cloth';
  }
}

for (const part of parts) if (/^arm[LR](Upper|Lower|Elbow)?$/.test(part.name)) part.color = 'ivory';
for (const side of [-1, 1])
  for (let i = 0; i < 3; i++)
    parts.push(
      s(
        'stitch' + side + i,
        'primary',
        [side * (0.08 + i * 0.057), 0.59, -0.16],
        [0.037, 0.055, 0.012],
        chevron,
        undefined,
        undefined,
        'cloth',
      ),
    );
parts.push(
  v(
    'hawkTail',
    'secondary',
    [0, -0.04, 0.08],
    [
      [0, 0, 0, 0.06],
      [0, -0.07, 0.18, 0.07],
      [0, -0.1, 0.24, 0.006],
    ],
    'hawk',
    [1, 0.4, 1],
  ),
);
export const clips = {
  attack: action('armR', [-0.65, 0, -0.35]),
  skill: action('hawk', [-0.15, 0.25, 0], [0, 0.17, -0.23]),
};
