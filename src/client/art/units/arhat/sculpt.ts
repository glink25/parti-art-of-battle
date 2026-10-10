import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.74, 0], [0.35, 0.23, 0.26], armour, undefined, undefined, 'cloth'),
  v(
    'torso',
    'ivory',
    [0, 0.24, 0],
    [
      [0, -0.13, 0, 0.18],
      [0, 0.07, 0, 0.27],
      [0, 0.27, 0, 0.17],
    ],
    'body',
    [1, 1, 0.7],
  ),
  q('head', 'sphere', 'ivory', [0, 0.39, -0.025], [0.26, 0.29, 0.25], 'torso', undefined, 'fur'),
  s(
    'shawl',
    'primary',
    [-0.1, 0.08, -0.19],
    [0.24, 0.42, 0.06],
    armour,
    'torso',
    [0, 0, -0.22],
    'cloth',
  ),
  s(
    'drape',
    'primary',
    [-0.2, -0.21, 0.055],
    [0.25, 0.64, 0.27],
    chevron,
    'body',
    [0, 0, -0.1],
    'cloth',
  ),
  s('sash', 'accent', [0, -0.015, -0.155], [0.34, 0.07, 0.04], armour, 'body', undefined, 'cloth'),
  ...limb('armL', [-0.25, 0.17, 0], [-0.33, -0.04, -0.04], [-0.12, -0.08, -0.24], 0.13, 'torso'),
  ...limb('armR', [0.25, 0.17, 0], [0.4, 0.01, -0.1], [0.4, 0.09, -0.34], 0.14, 'torso'),
  s('palm', 'ivory', [0, 0.035, -0.025], [0.16, 0.19, 0.075], armour, 'armREnd', undefined, 'fur'),
  q(
    'focus',
    'sphere',
    'energy',
    [0, 0.07, -0.07],
    [0.06, 0.06, 0.022],
    'palm',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.11, -0.08, 0],
      [side * 0.21, -0.3, side * 0.065],
      [side * 0.28, -0.52, side * 0.085],
      0.14,
      'body',
    ),
    s(
      'foot' + n,
      'secondary',
      [0, -0.01, -0.055],
      [0.2, 0.1, 0.27],
      armour,
      'leg' + n + 'End',
      undefined,
      'cloth',
    ),
    q(
      'ear' + n,
      'capsule',
      'ivory',
      [side * 0.135, -0.035, 0.005],
      [0.04, 0.12, 0.045],
      'head',
      undefined,
      'fur',
    ),
  );
}
for (let i = 0; i < 11; i++) {
  const a = (i / 10) * Math.PI;
  parts.push(
    q(
      'bead' + i,
      'sphere',
      'secondary',
      [Math.cos(a) * 0.17, 0.24 - Math.sin(a) * 0.2, -0.21],
      [0.057, 0.057, 0.057],
      'torso',
      undefined,
      'wood',
    ),
  );
}
for (let i = 0; i < 4; i++)
  parts.push(
    q(
      'finger' + i,
      'capsule',
      'ivory',
      [(i - 1.5) * 0.037, 0.135, -0.018],
      [0.033, 0.12 - i * 0.009, 0.035],
      'palm',
      undefined,
      'fur',
    ),
  );
export const clips = {
  attack: action('armR', [-0.18, 0, -0.08], [0, 0, -0.05]),
  skill: {
    tracks: [
      ...action('armR', [-0.25, 0, -0.1], [0, 0, -0.08]).tracks,
      ...action('armL', [-0.2, 0, 0.15]).tracks,
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
