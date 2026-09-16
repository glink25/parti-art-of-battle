import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('deck', 'primary', [0, 0.49, 0.02], [0.58, 0.21, 0.68], armour),
  s('front', 'secondary', [0, -0.02, -0.37], [0.57, 0.2, 0.08], chevron, 'deck'),
  q(
    'axle',
    'cylinder',
    'accent',
    [0, 0.26, 0.06],
    [0.19, 0.59, 0.19],
    'deck',
    [0, 0, Math.PI / 2],
    'brass',
  ),
  s('arm', 'secondary', [0, 0.26, 0.06], [0.105, 0.16, 0.14], armour, 'deck', [-0.65, 0, 0]),
  s(
    'beam',
    'primary',
    [0, 0.23, 0],
    [0.12, 0.68, 0.13],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.35, 0.5],
      [-0.35, 0.5],
    ],
    'arm',
  ),
  s(
    'spoon',
    'accent',
    [0, 0.6, 0],
    [0.29, 0.19, 0.29],
    [
      [-0.5, 0.5],
      [-0.32, -0.5],
      [0.32, -0.5],
      [0.5, 0.5],
    ],
    'arm',
    undefined,
    'brass',
  ),
  q('stone', 'dodeca', 'energy', [0, 0.72, 0], [0.25, 0.25, 0.25], 'arm', undefined, 'stone', true),
  s('counterweight', 'dark', [0, -0.23, 0], [0.32, 0.2, 0.28], armour, 'arm'),
];
for (const side of [-1, 1]) {
  const n = 'track' + side;
  parts.push(
    s(
      n,
      'dark',
      [side * 0.34, 0.32, 0.035],
      [0.76, 0.28, 0.18],
      [
        [-0.5, -0.1],
        [-0.36, -0.5],
        [0.36, -0.5],
        [0.5, -0.1],
        [0.5, 0.16],
        [0.34, 0.5],
        [-0.34, 0.5],
        [-0.5, 0.16],
      ],
      undefined,
      [0, Math.PI / 2, 0],
    ),
    s(
      'support' + side,
      'secondary',
      [side * 0.21, 0.21, 0.08],
      [0.13, 0.48, 0.34],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.35, 0.5],
        [-0.1, 0.5],
      ],
      'deck',
    ),
  );
  for (let i = 0; i < 4; i++)
    parts.push(
      q(
        n + 'Roller' + i,
        'cylinder',
        'accent',
        [side * 0.445, 0.32, (i - 1.5) * 0.155 + 0.035],
        [0.17, 0.035, 0.17],
        undefined,
        [0, 0, Math.PI / 2],
        'brass',
      ),
    );
  for (let i = 0; i < 8; i++)
    for (const y of [0.19, 0.45])
      parts.push(
        q(
          n + 'Tread' + i + y,
          'roundedBox',
          'secondary',
          [side * 0.34, y, (i - 3.5) * 0.087 + 0.035],
          [0.205, 0.035, 0.06],
        ),
      );
}
export const clips = { attack: action('arm', [1.15, 0, 0]), skill: action('arm', [1.35, 0, 0]) };
