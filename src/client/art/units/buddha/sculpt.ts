import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  q('root', 'sphere', 'dark', [0, 0, 0], [0.001, 0.001, 0.001]),
  v(
    'body',
    'secondary',
    [0, 1.02, 0],
    [
      [0, -0.24, 0, 0.19],
      [0, 0, 0, 0.28],
      [0, 0.29, 0, 0.24],
    ],
    undefined,
    [1, 1, 0.7],
    'cloth',
  ),
  s('breastplate', 'primary', [0, 1.13, -0.19], [0.45, 0.38, 0.07], armour),
  s('belt', 'accent', [0, 0.83, -0.13], [0.44, 0.12, 0.1], armour),
  s('fauld', 'primary', [0, 0.65, -0.16], [0.34, 0.37, 0.06], chevron),
  ...limb('armL', [-0.26, 1.25, 0], [-0.47, 1.11, -0.06], [-0.46, 0.99, -0.24], 0.17, 'root'),
  ...limb('armR', [0.26, 1.25, 0], [0.43, 1.1, -0.13], [0.44, 1.17, -0.32], 0.17, 'root'),
  q('head', 'sphere', 'secondary', [0, 1.57, 0], [0.34, 0.37, 0.29], undefined, undefined, 'fur'),
  q('muzzle', 'sphere', 'ivory', [0, -0.06, -0.13], [0.25, 0.16, 0.13], 'head', undefined, 'fur'),
  q('nose', 'sphere', 'dark', [0, -0.016, -0.205], [0.07, 0.04, 0.025], 'head', undefined, 'fur'),
  q('circlet', 'torus', 'accent', [0, 0.11, 0], [0.36, 0.3, 0.04], 'head', [Math.PI / 2, 0, 0]),
  q(
    'forehead',
    'octa',
    'energy',
    [0, 0.14, -0.15],
    [0.09, 0.12, 0.035],
    'head',
    undefined,
    'glass',
    true,
  ),
  q('sun', 'torus', 'accent', [0, 1.49, 0.19], [0.92, 0.92, 0.055], undefined, undefined, 'brass'),
  q('staff', 'cylinder', 'secondary', [0, 0, 0], [0.055, 1.66, 0.055], 'armREnd'),
  v(
    'tail',
    'secondary',
    [0, 0.84, 0.14],
    [
      [0, 0, 0, 0.045],
      [0.31, -0.15, 0.2, 0.04],
      [0.54, -0.05, 0.16, 0.032],
      [0.62, 0.18, 0.1, 0.025],
      [0.53, 0.3, 0.1, 0.005],
    ],
    undefined,
    [1, 1, 1],
    'fur',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.15, 0.82, 0],
      [side * 0.24, 0.54, 0],
      [side * 0.33, 0.25, side * 0.04],
      0.19,
      'root',
    ),
    q(
      'foot' + n,
      'roundedBox',
      'primary',
      [side * 0.33, 0.22, side * 0.04 - 0.06],
      [0.24, 0.12, 0.31],
    ),
    s('greave' + n, 'primary', [side * 0.29, 0.42, -0.1], [0.2, 0.31, 0.08], armour, undefined, [
      0,
      0,
      -side * 0.2,
    ]),
    s('pauldron' + n, 'primary', [side * 0.29, 1.26, 0], [0.34, 0.24, 0.31], chevron, undefined, [
      0,
      0,
      side * 0.24,
    ]),
    s('tasset' + n, 'primary', [side * 0.24, 0.69, 0], [0.22, 0.34, 0.23], chevron, undefined, [
      0,
      0,
      side * 0.3,
    ]),
    q(
      'hand' + n,
      'sphere',
      'ivory',
      [0, 0, 0],
      [0.15, 0.15, 0.13],
      'arm' + n + 'End',
      undefined,
      'fur',
    ),
    q(
      'ear' + n,
      'sphere',
      'secondary',
      [side * 0.18, 0.01, 0],
      [0.13, 0.17, 0.07],
      'head',
      undefined,
      'fur',
    ),
    q(
      'eyeMask' + n,
      'sphere',
      'ivory',
      [side * 0.083, 0.04, -0.115],
      [0.13, 0.14, 0.065],
      'head',
      undefined,
      'fur',
    ),
    q(
      'eye' + n,
      'roundedBox',
      'dark',
      [side * 0.078, 0.04, -0.151],
      [0.06, 0.025, 0.015],
      'head',
      undefined,
      'fur',
    ),
    v(
      'plume' + n,
      'primary',
      [side * 0.11, 0.13, 0.02],
      [
        [0, 0, 0, 0.045],
        [side * 0.07, 0.24, 0.06, 0.035],
        [side * 0.14, 0.4, 0.18, 0.023],
        [side * 0.26, 0.32, 0.31, 0.005],
      ],
      'head',
    ),
    q('staffCap' + n, 'cylinder', 'accent', [0, side * 0.73, 0], [0.095, 0.21, 0.095], 'staff'),
    q(
      'staffTip' + n,
      'sphere',
      'energy',
      [0, side * 0.84, 0],
      [0.08, 0.04, 0.08],
      'staff',
      undefined,
      'glass',
      true,
    ),
  );
}
for (let i = 0; i < 12; i++) {
  const a = (i * Math.PI) / 6;
  parts.push(
    s(
      'sunRay' + i,
      'primary',
      [Math.sin(a) * 0.49, 1.49 + Math.cos(a) * 0.49, 0.19],
      [0.06, 0.14, 0.035],
      chevron,
      undefined,
      [0, 0, -a],
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

for (const side of [-1, 1])
  for (let i = 0; i < 3; i++)
    parts.push(
      s(
        'lamella' + side + i,
        'accent',
        [side * 0.095, 1.21 - i * 0.08, -0.235],
        [0.15, 0.06, 0.02],
        chevron,
      ),
    );
parts.push(
  v(
    'mouth',
    'dark',
    [0, -0.1, -0.191],
    [
      [-0.065, 0, 0, 0.006],
      [0, -0.008, 0, 0.007],
      [0.065, 0, 0, 0.006],
    ],
    'head',
  ),
);
export const clips = {
  attack: action('armR', [-0.15, 0.2, -0.65]),
  skill: {
    tracks: [
      ...action('armR', [-0.3, -0.5, -0.85]).tracks,
      ...action('armL', [-0.3, 0, 0.35]).tracks,
    ],
  },
};
