import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Upright bull king: cloven hooves, bovine muzzle, curling horns and a gripped ironwood mace.
export const parts: ArtPart[] = [
  v(
    'hips',
    'secondary',
    [0, 0.76, 0.025],
    [
      [0, -0.08, 0, 0.19],
      [0, 0.08, 0, 0.23],
      [0, 0.16, 0, 0.15],
    ],
    undefined,
    [1, 1, 0.75],
  ),
  v(
    'torso',
    'primary',
    [0, 0.18, 0],
    [
      [0, -0.12, 0, 0.18],
      [0, 0.08, 0.025, 0.3],
      [0, 0.3, 0.02, 0.34],
      [0, 0.39, 0, 0.18],
    ],
    'hips',
    [1, 1, 0.75],
  ),
  v(
    'neck',
    'secondary',
    [0, 0.37, -0.015],
    [
      [0, -0.03, 0, 0.13],
      [0, 0.13, -0.05, 0.16],
    ],
    'torso',
  ),
  v(
    'head',
    'secondary',
    [0, 0.13, -0.065],
    [
      [0, 0.1, 0.015, 0.12],
      [0, 0.04, -0.075, 0.2],
      [0, -0.1, -0.13, 0.17],
    ],
    'neck',
  ),
  v(
    'muzzle',
    'primary',
    [0, -0.065, -0.15],
    [
      [0, 0.01, 0.02, 0.12],
      [0, -0.01, -0.1, 0.15],
      [0, -0.02, -0.18, 0.105],
    ],
    'head',
    [1, 0.6, 1],
  ),
  v(
    'jaw',
    'secondary',
    [0, -0.145, -0.15],
    [
      [0, 0, 0, 0.11],
      [0, 0, -0.17, 0.1],
    ],
    'head',
    [1, 0.4, 1],
  ),
  q(
    'noseRing',
    'torus',
    'accent',
    [0, -0.14, -0.325],
    [0.09, 0.1, 0.06],
    'head',
    undefined,
    'brass',
  ),
  s('belt', 'dark', [0, 0.02, -0.14], [0.43, 0.14, 0.08], armour, 'hips', undefined, 'cloth'),
  s(
    'buckle',
    'accent',
    [0, 0.025, -0.195],
    [0.13, 0.13, 0.025],
    armour,
    'hips',
    undefined,
    'brass',
  ),
  s(
    'loincloth',
    'secondary',
    [0, -0.19, -0.17],
    [0.32, 0.31, 0.045],
    chevron,
    'hips',
    undefined,
    'cloth',
  ),
  v(
    'tail',
    'secondary',
    [0, -0.06, 0.17],
    [
      [0, 0, 0, 0.032],
      [0.17, -0.12, 0.15, 0.03],
      [0.22, -0.27, 0.15, 0.018],
    ],
    'hips',
  ),
  v(
    'tailTuft',
    'dark',
    [0.22, -0.33, 0.32],
    [
      [0, 0.05, 0, 0.04],
      [0, -0.04, 0, 0.045],
      [0, -0.11, 0, 0.001],
    ],
    'hips',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'leg' + n,
      'primary',
      [side * 0.14, -0.05, 0],
      [
        [0, 0, 0, 0.11],
        [side * 0.055, -0.18, 0.045, 0.12],
        [side * 0.06, -0.33, 0.055, 0.075],
        [side * 0.065, -0.45, 0.005, 0.06],
      ],
      'hips',
    ),
    s(
      'hoof' + n,
      'dark',
      [side * 0.065, -0.475, -0.035],
      [0.19, 0.135, 0.25],
      armour,
      'leg' + n,
      undefined,
      'fur',
    ),
    q(
      'hoofSplit' + n,
      'roundedBox',
      'ivory',
      [side * 0.065, -0.47, -0.168],
      [0.012, 0.085, 0.012],
      'leg' + n,
      undefined,
      'stone',
    ),
    v(
      'horn' + n,
      'ivory',
      [side * 0.14, 0.12, 0.015],
      [
        [0, 0, 0, 0.065],
        [side * 0.15, 0.04, 0.02, 0.057],
        [side * 0.22, 0.18, 0.03, 0.04],
        [side * 0.18, 0.3, -0.01, 0.019],
        [side * 0.1, 0.36, -0.03, 0.002],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
    s(
      'ear' + n,
      'primary',
      [side * 0.25, 0.015, 0.02],
      [0.22, 0.12, 0.065],
      [
        [-0.5, 0],
        [0, 0.5],
        [0.5, 0.15],
        [0.25, -0.4],
        [-0.2, -0.5],
      ],
      'head',
      [0, 0, side * 0.25],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.13, 0.035, -0.275],
      [0.053, 0.036, 0.035],
      'head',
      undefined,
      'glass',
      true,
    ),
    s(
      'brow' + n,
      'dark',
      [side * 0.125, 0.077, -0.265],
      [0.16, 0.055, 0.065],
      chevron,
      'head',
      [0, 0, -side * 0.22],
      'fur',
    ),
    q(
      'nostril' + n,
      'sphere',
      'dark',
      [side * 0.061, -0.065, -0.322],
      [0.043, 0.028, 0.019],
      'head',
      undefined,
      'fur',
    ),
  );
}
parts.push(
  v(
    'armR',
    'primary',
    [0.32, 0.23, 0.005],
    [
      [0, 0, 0, 0.135],
      [0.13, -0.12, 0.015, 0.12],
      [0.14, -0.31, -0.08, 0.105],
      [0.11, -0.39, -0.14, 0.075],
    ],
    'torso',
  ),
  q(
    'handR',
    'sphere',
    'secondary',
    [0.11, -0.39, -0.14],
    [0.19, 0.17, 0.18],
    'armR',
    undefined,
    'fur',
  ),
  v(
    'armL',
    'primary',
    [-0.32, 0.23, 0.005],
    [
      [0, 0, 0, 0.135],
      [-0.1, -0.17, -0.05, 0.105],
      [-0.06, -0.31, -0.22, 0.08],
    ],
    'torso',
  ),
  q(
    'handL',
    'sphere',
    'secondary',
    [-0.06, -0.31, -0.22],
    [0.18, 0.19, 0.18],
    'armL',
    undefined,
    'fur',
  ),
  s('pauldron', 'dark', [-0.015, 0.025, 0], [0.33, 0.25, 0.34], armour, 'armL'),
  s(
    'pauldronTrim',
    'accent',
    [-0.025, 0.04, -0.18],
    [0.27, 0.17, 0.04],
    chevron,
    'armL',
    undefined,
    'brass',
  ),
  v(
    'club',
    'secondary',
    [0, 0, 0],
    [
      [0, -0.19, 0, 0.044],
      [0, 0.16, 0, 0.052],
      [0, 0.38, 0, 0.14],
      [0, 0.67, 0, 0.15],
      [0, 0.73, 0, 0.075],
    ],
    'handR',
    [1, 1, 1],
    'wood',
  ),
);
for (const y of [0.29, 0.59])
  parts.push(q('clubBand' + y, 'cylinder', 'dark', [0, y, 0], [0.3, 0.085, 0.3], 'club'));
for (let i = 0; i < 4; i++) {
  const a = (i * Math.PI) / 2;
  parts.push(
    s(
      'clubStud' + i,
      'accent',
      [Math.cos(a) * 0.15, 0.44, Math.sin(a) * 0.15],
      [0.08, 0.16, 0.06],
      armour,
      'club',
      [0, -a, 0],
      'brass',
    ),
  );
}
for (let i = 0; i < 3; i++)
  parts.push(
    q(
      'finger' + i,
      'capsule',
      'primary',
      [0.04, (i - 1) * 0.045, -0.065],
      [0.1, 0.035, 0.04],
      'handR',
      [0, 0, Math.PI / 2],
      'fur',
    ),
  );
export const clips = {
  attack: action('armR', [-0.65, 0, -0.1]),
  skill: {
    tracks: [
      ...action('head', [0.18, 0, 0]).tracks,
      ...action('jaw', [-0.5, 0, 0]).tracks,
      ...action('armL', [-0.4, 0, 0.16]).tracks,
    ],
  },
};
