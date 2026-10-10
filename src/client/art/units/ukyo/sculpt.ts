import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 1.02, 0],
    [
      [0, -0.25, 0, 0.17],
      [0, 0, 0, 0.22],
      [0, 0.23, 0, 0.2],
    ],
    undefined,
    [1, 1, 0.72],
    'cloth',
  ),
  s('belt', 'accent', [0, 0.8, -0.12], [0.36, 0.08, 0.08], armour, undefined, undefined, 'cloth'),
  s(
    'lapel',
    'ivory',
    [-0.035, 1.09, -0.15],
    [0.2, 0.37, 0.035],
    chevron,
    undefined,
    [0, 0, 0.32],
    'cloth',
  ),
  ...limb('armL', [-0.21, 1.17, 0], [-0.34, 0.99, -0.06], [-0.24, 0.85, -0.2], 0.13, 'bodyRoot'),
  ...limb('armR', [0.21, 1.17, 0], [0.38, 1.04, -0.12], [0.29, 1.02, -0.35], 0.13, 'bodyRoot'),
  q('bodyRoot', 'sphere', 'dark', [0, 0, 0], [0.001, 0.001, 0.001]),

  q('head', 'sphere', 'ivory', [0, 1.44, -0.025], [0.27, 0.33, 0.25], undefined, undefined, 'fur'),
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
  q('hairCap', 'sphere', 'ivory', [0, 0.075, 0.04], [0.3, 0.26, 0.26], 'head', undefined, 'fur'),

  q('grip', 'cylinder', 'dark', [0, 0, 0], [0.055, 0.22, 0.055], 'armREnd', [0, 0, -1.05], 'cloth'),
  q('guard', 'cylinder', 'accent', [0, 0.13, 0], [0.15, 0.028, 0.11], 'grip'),
  s(
    'blade',
    'ivory',
    [0, 0.15, 0],
    [0.075, 0.77, 0.025],
    [
      [-0.5, 0],
      [0.4, 0],
      [0.45, 0.7],
      [0.05, 1],
      [-0.18, 0.72],
    ],
    'grip',
    undefined,
    'steel',
  ),
  q(
    'bladeTip',
    'sphere',
    'energy',
    [0, 0.76, 0],
    [0.025, 0.04, 0.025],
    'blade',
    undefined,
    'glass',
    true,
  ),
  v(
    'sheath',
    'secondary',
    [-0.24, 0.8, 0],
    [
      [0, 0, 0, 0.04],
      [-0.1, -0.13, 0.24, 0.04],
      [-0.22, -0.27, 0.5, 0.025],
    ],
    undefined,
    [1, 1, 1],
    'wood',
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
      [side * 0.13, 0.78, 0],
      [side * 0.21, 0.52, side * 0.06],
      [side * 0.27, 0.24, side * 0.08],
      0.16,
      'bodyRoot',
    ),
    q(
      'foot' + n,
      'roundedBox',
      'dark',
      [side * 0.27, 0.22, side * 0.08 - 0.06],
      [0.2, 0.12, 0.29],
      undefined,
      undefined,
      'cloth',
    ),
    s(
      'coat' + n,
      'primary',
      [side * 0.18, 0.67, 0.09],
      [0.31, 0.51, 0.1],
      chevron,
      undefined,
      [0, side * 0.25, side * 0.16],
      'cloth',
    ),
    s(
      'coatTrim' + n,
      'accent',
      [side * 0.24, 0.47, 0.025],
      [0.16, 0.035, 0.025],
      armour,
      undefined,
      [0, 0, side * 0.16],
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
    v(
      'lock' + n,
      'ivory',
      [side * 0.13, 0.05, 0.02],
      [
        [0, 0.06, 0, 0.065],
        [side * 0.025, -0.09, -0.015, 0.06],
        [side * 0.02, -0.24, 0.04, 0.004],
      ],
      'head',
    ),
  );
}
for (let i = 0; i < 5; i++)
  parts.push(
    v(
      'fringe' + i,
      'ivory',
      [(i - 2) * 0.046, 0.14, -0.075],
      [
        [0, 0, 0, 0.038],
        [0.022, -0.07, -0.042, 0.027],
        [0.018, -0.12, -0.04, 0.002],
      ],
      'head',
    ),
  );
for (let i = 0; i < 4; i++)
  parts.push(
    q(
      'gripWrap' + i,
      'torus',
      'accent',
      [0, -0.08 + i * 0.047, 0],
      [0.06, 0.06, 0.025],
      'grip',
      [Math.PI / 2, 0, 0],
      'cloth',
    ),
  );

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

for (let i = 0; i < 4; i++)
  parts.push(
    q(
      'coatButton' + i,
      'sphere',
      'accent',
      [0.1, 1.12 - i * 0.077, -0.165],
      [0.023, 0.023, 0.012],
      undefined,
      undefined,
      'brass',
    ),
  );
export const clips = {
  attack: action('armR', [-0.25, 0.25, -0.48]),
  skill: {
    tracks: [
      ...action('armR', [-0.45, -0.4, -0.8]).tracks,
      ...action('coatL', [0.15, 0.2, -0.12]).tracks,
    ],
  },
};
