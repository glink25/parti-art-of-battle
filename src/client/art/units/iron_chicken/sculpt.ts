import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'primary', [0, 0.78, 0.06], [0.4, 0.42, 0.5], armour),
  s('breast', 'ivory', [0, -0.02, -0.25], [0.31, 0.32, 0.1], chevron, 'body'),
  ...linkage('neck', [0, 0.12, -0.17], [0, 0.32, -0.24], [0, 0.41, -0.34], 0.14, 'body'),
  s('head', 'primary', [0, 0.025, -0.035], [0.24, 0.21, 0.29], armour, 'neckEnd'),
  s(
    'beak',
    'accent',
    [0, -0.015, -0.23],
    [0.38, 0.15, 0.14],
    [
      [-0.5, 0],
      [0.5, 0.5],
      [0.5, -0.5],
    ],
    'head',
    [0, -Math.PI / 2, 0],
    'brass',
  ),
  s(
    'comb',
    'accent',
    [0, 0.18, 0.01],
    [0.34, 0.2, 0.065],
    [
      [-0.5, -0.5],
      [-0.5, 0.3],
      [-0.25, 0],
      [0, 0.5],
      [0.18, 0.04],
      [0.45, 0.4],
      [0.5, -0.5],
    ],
    'head',
    [0, Math.PI / 2, 0],
  ),
  s('wattle', 'accent', [0, -0.17, -0.08], [0.09, 0.19, 0.065], chevron, 'head'),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...linkage(
      'leg' + n,
      [side * 0.14, -0.14, 0.07],
      [side * 0.22, -0.33, 0.18],
      [side * 0.21, -0.55, -0.035],
      0.095,
      'body',
    ),
    s(
      'wing' + n,
      'secondary',
      [side * 0.23, 0.025, 0.04],
      [0.38, 0.3, 0.07],
      [
        [-0.5, 0.3],
        [-0.25, 0.5],
        [0.5, 0.05],
        [0.35, -0.5],
        [-0.35, -0.25],
      ],
      'body',
      [0, (side * Math.PI) / 2, -side * 0.15],
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.126, 0.045, -0.06],
      [0.05, 0.055, 0.065],
      'head',
      undefined,
      'glass',
      true,
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      s(
        'feather' + n + i,
        'primary',
        [side * 0.275, -0.04 + i * 0.055, 0.12 + i * 0.07],
        [0.22, 0.12, 0.045],
        chevron,
        'body',
        [0, (side * Math.PI) / 2, -side * 0.25],
      ),
      ...linkage(
        'toe' + n + i,
        [(i - 1) * 0.045, -0.005, 0],
        [(i - 1) * 0.075, -0.025, -0.09],
        [(i - 1) * 0.085, -0.035, -0.17],
        0.028,
        'leg' + n + 'End',
      ),
    );
}
for (let i = 0; i < 5; i++)
  parts.push(
    s(
      'tail' + i,
      i % 2 ? 'accent' : 'secondary',
      [(i - 2) * 0.085, 0.24, 0.38],
      [0.13, 0.58, 0.065],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.4, 0.3],
        [0, 0.5],
        [-0.4, 0.3],
      ],
      'body',
      [0.55, 0, -(i - 2) * 0.18],
    ),
  );
export const clips = {
  attack: action('neck', [-0.48, 0, 0]),
  skill: {
    tracks: [
      ...action('neck', [-0.6, 0, 0]).tracks,
      ...action('wingL', [0, -0.4, 0]).tracks,
      ...action('wingR', [0, 0.4, 0]).tracks,
    ],
  },
};
