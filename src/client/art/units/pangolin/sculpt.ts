import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// A low arched back with individual shingled scales continuing along a long tapered tail.
export const parts: ArtPart[] = [
  v(
    'body',
    'secondary',
    [0, 0.57, 0.025],
    [
      [0, -0.04, -0.31, 0.095],
      [0, 0.06, -0.14, 0.21],
      [0, 0.075, 0.11, 0.26],
      [0, -0.015, 0.35, 0.18],
      [0, -0.05, 0.44, 0.09],
    ],
    undefined,
    [1, 0.88, 1],
  ),
  v(
    'neck',
    'secondary',
    [0, -0.025, -0.28],
    [
      [0, 0, 0.05, 0.11],
      [0, -0.035, -0.12, 0.09],
    ],
    'body',
  ),
  v(
    'head',
    'primary',
    [0, -0.03, -0.13],
    [
      [0, 0.015, 0.04, 0.09],
      [0, -0.01, -0.075, 0.08],
      [0, -0.035, -0.24, 0.024],
    ],
    'neck',
  ),
  q('nose', 'sphere', 'dark', [0, -0.035, -0.255], [0.055, 0.045, 0.045], 'head', undefined, 'fur'),
  v(
    'tail',
    'secondary',
    [0, -0.035, 0.38],
    [
      [0, 0, 0, 0.13],
      [0, -0.055, 0.21, 0.12],
      [0.055, -0.12, 0.42, 0.09],
      [0.13, -0.18, 0.6, 0.05],
      [0.19, -0.2, 0.73, 0.002],
    ],
    'body',
  ),
  q('core', 'octa', 'energy', [0, 0.3, 0.1], [0.08, 0.1, 0.08], 'body', undefined, 'glass', true),
];
const scaleOutline: [number, number][] = [
  [-0.5, 0.5],
  [0.5, 0.5],
  [0.46, 0.1],
  [0.25, -0.25],
  [0, -0.5],
  [-0.25, -0.25],
  [-0.46, 0.1],
];
for (let row = 0; row < 6; row++) {
  const z = -0.21 + row * 0.115,
    r = 0.2 + Math.sin((row / 5) * Math.PI) * 0.06;
  for (let col = -2; col <= 2; col++) {
    const a = col * 0.56;
    parts.push(
      s(
        'scale' + row + ':' + col,
        (row + col) % 3 === 0 ? 'accent' : 'primary',
        [Math.sin(a) * r, 0.04 + Math.cos(a) * r * 0.88, z + (col % 2) * 0.035],
        [0.16, 0.22, 0.043],
        scaleOutline,
        'body',
        [-Math.PI / 2, a, 0],
        'stone',
      ),
    );
  }
}
for (let row = 0; row < 6; row++) {
  const t = row / 5,
    r = 0.13 * (1 - t) + 0.025,
    x = 0.16 * t * t,
    y = -0.15 * t,
    z = 0.06 + row * 0.113;
  for (const col of [-1, 0, 1])
    parts.push(
      s(
        'tailScale' + row + ':' + col,
        row % 2 ? 'primary' : 'accent',
        [x + col * r * 0.65, y + r * 0.72, z],
        [r * 0.95, 0.19 - row * 0.011, 0.035],
        scaleOutline,
        'tail',
        [-Math.PI / 2, col * 0.7, 0],
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
      'dark',
      [side * 0.066, 0.03, -0.078],
      [0.03, 0.035, 0.024],
      'head',
      undefined,
      'glass',
    ),
    q(
      'ear' + n,
      'sphere',
      'secondary',
      [side * 0.085, 0.035, 0.015],
      [0.065, 0.07, 0.025],
      'head',
      undefined,
      'fur',
    ),
  );
  for (const fore of [true, false]) {
    const leg = (fore ? 'fore' : 'hind') + n;
    parts.push(
      v(
        leg,
        'secondary',
        [side * 0.15, -0.085, fore ? -0.17 : 0.3],
        [
          [0, 0.025, 0, 0.065],
          [side * 0.085, -0.09, fore ? 0.04 : 0.05, 0.065],
          [side * 0.07, -0.235, fore ? -0.025 : 0.01, 0.035],
        ],
        'body',
      ),
      q(
        leg + 'Foot',
        'sphere',
        'secondary',
        [side * 0.07, -0.265, fore ? -0.06 : -0.015],
        [0.12, 0.1, 0.16],
        leg,
        undefined,
        'fur',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        v(
          leg + 'Claw' + i,
          'ivory',
          [(i - 1) * 0.036, -0.005, -0.05],
          [
            [0, 0, 0, 0.022],
            [0, -0.01, -0.075, 0.015],
            [0, 0.006, -0.105, 0.002],
          ],
          leg + 'Foot',
          [1, 1, 1],
          'stone',
        ),
      );
  }
}
export const clips = {
  attack: {
    tracks: [
      ...action('foreR', [-0.35, 0, -0.1]).tracks,
      ...action('head', [-0.15, 0, 0], [0, 0, -0.035]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...action('neck', [-0.2, 0, 0], [0, -0.015, -0.035]).tracks,
      ...action('tail', [0, 0.3, 0]).tracks,
    ],
  },
};
