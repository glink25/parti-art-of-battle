import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Broad low carapace, distinct overlapping scutes and four splayed, load-bearing legs.
export const parts: ArtPart[] = [
  v(
    'body',
    'secondary',
    [0, 0.46, 0.08],
    [
      [0, 0, -0.38, 0.14],
      [0, 0.045, -0.17, 0.31],
      [0, 0.05, 0.18, 0.33],
      [0, -0.02, 0.4, 0.17],
    ],
    undefined,
    [1.2, 0.6, 1],
  ),
  q('shell', 'sphere', 'secondary', [0, 0.1, 0.025], [0.9, 0.53, 1.03], 'body', undefined, 'stone'),
  q(
    'rim',
    'torus',
    'ivory',
    [0, -0.015, 0.025],
    [0.74, 0.86, 0.13],
    'shell',
    [Math.PI / 2, 0, 0],
    'stone',
  ),
  v(
    'neck',
    'secondary',
    [0, 0.015, -0.35],
    [
      [0, 0, 0.05, 0.105],
      [0, 0.03, -0.11, 0.115],
      [0, 0.05, -0.23, 0.09],
    ],
    'body',
  ),
  v(
    'head',
    'secondary',
    [0, 0.055, -0.23],
    [
      [0, 0, 0.05, 0.095],
      [0, 0.025, -0.07, 0.14],
      [0, -0.01, -0.17, 0.105],
    ],
    'neck',
    [1, 1, 1],
  ),
  s(
    'beak',
    'ivory',
    [0, -0.01, -0.18],
    [0.21, 0.12, 0.1],
    [
      [-0.5, 0.4],
      [0, 0.25],
      [0.5, 0.4],
      [0.4, -0.2],
      [0, -0.5],
      [-0.4, -0.2],
    ],
    'head',
    undefined,
    'stone',
  ),
  v(
    'jaw',
    'secondary',
    [0, -0.075, -0.1],
    [
      [0, 0, 0, 0.07],
      [0, 0, -0.13, 0.065],
    ],
    'head',
    [1, 0.5, 1],
  ),
  v(
    'tail',
    'secondary',
    [0, -0.06, 0.38],
    [
      [0, 0, 0, 0.075],
      [0.04, -0.05, 0.19, 0.04],
      [0.06, -0.09, 0.3, 0.003],
    ],
    'body',
  ),
  q(
    'ward',
    'octa',
    'energy',
    [0, 0.37, 0.025],
    [0.115, 0.14, 0.13],
    'body',
    undefined,
    'glass',
    true,
  ),
];
const hex: [number, number][] = [
  [-0.5, 0],
  [-0.25, 0.5],
  [0.25, 0.5],
  [0.5, 0],
  [0.25, -0.5],
  [-0.25, -0.5],
];
for (const a of [-0.85, 0, 0.85])
  for (let i = 0; i < 3; i++) {
    parts.push(
      s(
        'scute' + a + i,
        'primary',
        [Math.sin(a) * 0.35, 0.1 + Math.cos(a) * 0.23, 0.025 + (i - 1) * 0.27],
        [0.36, 0.35, 0.055],
        hex,
        'body',
        [-Math.PI / 2, a, 0],
        'stone',
      ),
    );
  }
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.112, 0.065, -0.115],
      [0.041, 0.045, 0.04],
      'head',
      undefined,
      'glass',
      true,
    ),
    s(
      'brow' + n,
      'primary',
      [side * 0.11, 0.095, -0.095],
      [0.12, 0.06, 0.075],
      chevron,
      'head',
      undefined,
      'stone',
    ),
  );
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n,
      z = fore ? -0.23 : 0.28;
    parts.push(
      v(
        leg,
        'secondary',
        [side * 0.27, -0.08, z],
        [
          [0, 0.03, 0, 0.105],
          [side * 0.12, -0.06, fore ? -0.05 : 0.06, 0.09],
          [side * 0.15, -0.17, fore ? -0.1 : 0.07, 0.07],
        ],
        'body',
      ),
      q(
        leg + 'Foot',
        'sphere',
        'secondary',
        [side * 0.16, -0.16, fore ? -0.12 : 0.075],
        [0.19, 0.12, 0.22],
        leg,
        undefined,
        'fur',
      ),
      s(
        leg + 'Cuff',
        'primary',
        [side * 0.1, -0.05, 0],
        [0.14, 0.15, 0.13],
        armour,
        leg,
        [0, 0, side * 0.4],
        'stone',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        q(
          leg + 'Claw' + i,
          'cone',
          'ivory',
          [(i - 1) * 0.055, -0.013, -0.105],
          [0.04, 0.085, 0.04],
          leg + 'Foot',
          [-Math.PI / 2, 0, 0],
          'stone',
        ),
      );
  }
}
export const clips = {
  attack: {
    tracks: [
      ...action('neck', [0, 0, 0], [0, 0, -0.09]).tracks,
      ...action('jaw', [-0.3, 0, 0]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...action('neck', [0.1, 0, 0], [0, -0.025, 0.075]).tracks,
      ...action('ward', [0, 0.5, 0], [0, 0.075, 0]).tracks,
    ],
  },
};
