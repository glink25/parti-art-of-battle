import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  q('root', 'sphere', 'dark', [0, 0, 0], [0.001, 0.001, 0.001]),
  v(
    'body',
    'primary',
    [0, 1.07, 0],
    [
      [0, -0.21, 0, 0.15],
      [0, 0.02, 0, 0.21],
      [0, 0.23, 0, 0.18],
    ],
    undefined,
    [1, 1, 0.7],
    'cloth',
  ),
  s(
    'bodice',
    'ivory',
    [0, 1.14, -0.145],
    [0.22, 0.27, 0.035],
    chevron,
    undefined,
    undefined,
    'cloth',
  ),
  s('belt', 'accent', [0, 0.91, -0.1], [0.33, 0.07, 0.12], armour),
  ...limb('armL', [-0.2, 1.23, 0], [-0.4, 1.16, -0.06], [-0.49, 1.29, -0.21], 0.12, 'root'),
  ...limb('armR', [0.2, 1.23, 0], [0.39, 1.12, -0.07], [0.48, 1.18, -0.28], 0.12, 'root'),

  q('head', 'sphere', 'ivory', [0, 1.56, -0.025], [0.27, 0.33, 0.25], undefined, undefined, 'fur'),
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
  q(
    'hairCap',
    'sphere',
    'secondary',
    [0, 0.075, 0.04],
    [0.3, 0.26, 0.26],
    'head',
    undefined,
    'fur',
  ),

  q('tiara', 'torus', 'accent', [0, 0.08, 0], [0.28, 0.24, 0.035], 'head', [Math.PI / 2, 0, 0]),
  q(
    'gem',
    'octa',
    'energy',
    [0, 0.13, -0.13],
    [0.09, 0.1, 0.035],
    'head',
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
      [side * 0.1, 0.87, 0],
      [side * 0.14, 0.55, 0],
      [side * 0.2, 0.25, side * 0.04],
      0.13,
      'root',
    ),
    q(
      'foot' + n,
      'roundedBox',
      'primary',
      [side * 0.2, 0.22, side * 0.04 - 0.06],
      [0.19, 0.12, 0.28],
      undefined,
      undefined,
      'cloth',
    ),
    s(
      'bootFront' + n,
      'primary',
      [side * 0.18, 0.43, -0.08],
      [0.15, 0.33, 0.07],
      armour,
      undefined,
      [0, 0, -side * 0.13],
      'cloth',
    ),
    s(
      'skirt' + n,
      'primary',
      [side * 0.11, 0.79, 0.02],
      [0.28, 0.26, 0.3],
      chevron,
      undefined,
      [0, 0, side * 0.2],
      'cloth',
    ),
    v(
      'hair' + n,
      'secondary',
      [side * 0.105, 0.08, 0.065],
      [
        [0, 0, 0, 0.09],
        [side * 0.06, -0.22, 0.08, 0.105],
        [side * 0.12, -0.49, 0.14, 0.08],
        [side * 0.24, -0.62, 0.08, 0.004],
      ],
      'head',
      [1, 1, 0.65],
    ),
    q(
      'hand' + n,
      'sphere',
      'ivory',
      [0, 0, 0],
      [0.12, 0.13, 0.1],
      'arm' + n + 'End',
      undefined,
      'fur',
    ),
    q(
      'crystal' + n,
      'octa',
      'energy',
      [0, 0.15, -0.04],
      [0.18, 0.28, 0.16],
      'hand' + n,
      undefined,
      'glass',
      true,
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'shard' + n + i,
        'octa',
        'energy',
        [side * (0.61 + i * 0.1), 0.9 + i * 0.29, 0.06],
        [0.06, 0.12, 0.05],
        undefined,
        [0, 0, side * 0.3],
        'glass',
        true,
      ),
    );
}
for (let i = 0; i < 5; i++)
  parts.push(
    v(
      'fringe' + i,
      'secondary',
      [(i - 2) * 0.043, 0.14, -0.06],
      [
        [0, 0, 0, 0.034],
        [0, -0.06, -0.055, 0.029],
        [0.01, -0.1, -0.05, 0.002],
      ],
      'head',
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

for (const part of parts) if (/^arm[LR](Upper|Lower|Elbow)?$/.test(part.name)) part.color = 'ivory';
for (const side of [-1, 1])
  parts.push(
    s(
      'cuff' + side,
      'primary',
      [0, 0.015, 0],
      [0.15, 0.09, 0.14],
      armour,
      'arm' + (side < 0 ? 'L' : 'R') + 'End',
      undefined,
      'cloth',
    ),
  );
export const clips = {
  attack: action('armR', [-0.35, 0.1, -0.28]),
  skill: {
    tracks: [
      ...action('armL', [-0.3, -0.15, 0.25]).tracks,
      ...action('armR', [-0.3, 0.15, -0.25]).tracks,
    ],
  },
};
