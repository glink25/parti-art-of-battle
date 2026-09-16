import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// A broad-mouthed toxic reptile: low splayed limbs and paired exposed dorsal glands.
export const parts: ArtPart[] = [
  v(
    'body',
    'secondary',
    [0, 0.57, 0.075],
    [
      [0, -0.015, -0.3, 0.12],
      [0, 0.015, -0.15, 0.25],
      [0, 0.01, 0.16, 0.27],
      [0, -0.04, 0.36, 0.17],
      [0, -0.03, 0.43, 0.055],
    ],
    undefined,
    [1.1, 0.8, 1],
  ),
  v(
    'neck',
    'primary',
    [0, 0.005, -0.27],
    [
      [0, 0, 0.045, 0.15],
      [0, 0.06, -0.12, 0.18],
    ],
    'body',
  ),
  v(
    'head',
    'secondary',
    [0, 0.045, -0.135],
    [
      [0, 0.015, 0.07, 0.16],
      [0, 0, -0.1, 0.2],
      [0, -0.03, -0.23, 0.17],
    ],
    'neck',
    [1.2, 0.72, 1],
  ),
  v(
    'jaw',
    'primary',
    [0, -0.12, -0.045],
    [
      [0, 0, 0.025, 0.15],
      [0, -0.01, -0.13, 0.17],
      [0, 0, -0.225, 0.12],
    ],
    'head',
    [1.12, 0.4, 1],
  ),
  s('mouth', 'dark', [0, -0.065, -0.238], [0.29, 0.05, 0.025], armour, 'head', undefined, 'fur'),
  q(
    'breath',
    'sphere',
    'energy',
    [0, -0.047, -0.261],
    [0.08, 0.045, 0.02],
    'head',
    undefined,
    'glass',
    true,
  ),
  v(
    'tail',
    'secondary',
    [0, -0.055, 0.37],
    [
      [0, 0, 0, 0.115],
      [0.12, -0.055, 0.19, 0.08],
      [0.23, -0.1, 0.34, 0.04],
      [0.35, -0.085, 0.42, 0.002],
    ],
    'body',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'brow' + n,
      'primary',
      [side * 0.16, 0.04, -0.075],
      [
        [0, 0, 0, 0.06],
        [side * 0.025, 0.065, -0.06, 0.05],
        [side * 0.015, 0.08, -0.13, 0.002],
      ],
      'head',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.15, 0.075, -0.229],
      [0.075, 0.06, 0.04],
      'head',
      undefined,
      'glass',
      true,
    ),
    q(
      'pupil' + n,
      'roundedBox',
      'dark',
      [side * 0.15, 0.075, -0.253],
      [0.012, 0.046, 0.01],
      'head',
      undefined,
      'fur',
    ),
    v(
      'fang' + n,
      'ivory',
      [side * 0.13, -0.04, -0.22],
      [
        [0, 0, 0, 0.028],
        [0, -0.11, -0.01, 0.02],
        [-side * 0.035, -0.15, -0.035, 0.001],
      ],
      'head',
      [1, 1, 1],
      'stone',
    ),
  );
  for (let i = 0; i < 2; i++) {
    const sac = 'sac' + n + i;
    parts.push(
      v(
        sac,
        'energy',
        [side * 0.17, 0.15, -0.02 + i * 0.23],
        [
          [0, -0.03, 0, 0.08],
          [side * 0.01, 0.08, 0, 0.13],
          [0, 0.2, 0.015, 0.07],
          [0, 0.23, 0.02, 0.025],
        ],
        'body',
        [1, 0.95, 1],
        'glass',
      ),
    );
    parts[parts.length - 1].emissive = true;
    parts.push(
      v(
        sac + 'Vein',
        'secondary',
        [side * 0.09, 0.12, -0.03 + i * 0.23],
        [
          [0, -0.03, 0.01, 0.016],
          [side * 0.1, 0.1, -0.09, 0.013],
          [side * 0.1, 0.22, -0.055, 0.008],
        ],
        'body',
      ),
    );
  }
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n;
    parts.push(
      v(
        leg,
        'primary',
        [side * 0.2, -0.09, fore ? -0.19 : 0.24],
        [
          [0, 0.02, 0, 0.1],
          [side * 0.16, -0.08, fore ? -0.04 : 0.09, 0.085],
          [side * 0.18, -0.23, fore ? -0.1 : 0.045, 0.052],
        ],
        'body',
      ),
      q(
        leg + 'Foot',
        'sphere',
        'secondary',
        [side * 0.18, -0.26, fore ? -0.125 : 0.01],
        [0.18, 0.11, 0.22],
        leg,
        undefined,
        'fur',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        v(
          leg + 'Toe' + i,
          'secondary',
          [(i - 1) * 0.048, -0.006, -0.055],
          [
            [0, 0, 0, 0.027],
            [(i - 1) * 0.015, -0.01, -0.09, 0.018],
            [(i - 1) * 0.02, 0, -0.12, 0.002],
          ],
          leg + 'Foot',
        ),
      );
  }
}
for (let i = 0; i < 4; i++)
  parts.push(
    s(
      'spine' + i,
      'primary',
      [0, 0.24 - i * 0.023, -0.08 + i * 0.16],
      [0.09, 0.16, 0.13],
      chevron,
      'body',
      [0, Math.PI / 2, 0],
      'fur',
    ),
  );
export const clips = {
  attack: {
    tracks: [
      ...action('neck', [-0.08, 0, 0], [0, 0, -0.07]).tracks,
      ...action('jaw', [-0.42, 0, 0]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...action('head', [0.12, 0, 0]).tracks,
      ...action('jaw', [-0.6, 0, 0]).tracks,
      ...action('sacL0', [0, 0, 0], [0, -0.045, 0]).tracks,
      ...action('sacR0', [0, 0, 0], [0, -0.045, 0]).tracks,
    ],
  },
};
