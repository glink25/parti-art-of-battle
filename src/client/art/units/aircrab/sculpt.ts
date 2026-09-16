import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// A suspended crustacean machine with true open pincers and articulated outrigger legs.
export const parts: ArtPart[] = [
  s(
    'shell',
    'primary',
    [0, 0.93, 0],
    [0.63, 0.36, 0.52],
    [
      [-0.5, -0.1],
      [-0.38, 0.38],
      [0, 0.5],
      [0.38, 0.38],
      [0.5, -0.1],
      [0.34, -0.5],
      [-0.34, -0.5],
    ],
  ),
  s('carapace', 'secondary', [0, 0.17, 0.025], [0.5, 0.4, 0.07], chevron, 'shell', [
    Math.PI / 2,
    0,
    0,
  ]),
  s('brow', 'ivory', [0, 0.03, -0.28], [0.39, 0.12, 0.08], chevron, 'shell'),
  ...barrel('cannon', [0, 0.25, -0.12], 'shell'),
  q('lift', 'cylinder', 'dark', [0, -0.24, 0.05], [0.32, 0.16, 0.32], 'shell'),
  q('liftRing', 'torus', 'accent', [0, -0.31, 0.05], [0.32, 0.32, 0.09], 'shell', [
    Math.PI / 2,
    0,
    0,
  ]),
  q(
    'liftCore',
    'sphere',
    'energy',
    [0, -0.34, 0.05],
    [0.22, 0.055, 0.22],
    'shell',
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...linkage(
      'arm' + n,
      [side * 0.28, -0.02, -0.09],
      [side * 0.48, -0.05, -0.22],
      [side * 0.53, -0.06, -0.43],
      0.105,
      'shell',
    ),
    s('claw' + n, 'secondary', [0, 0, -0.05], [0.27, 0.18, 0.27], armour, 'arm' + n + 'End'),
    q(
      'eyeStem' + n,
      'cylinder',
      'accent',
      [side * 0.19, 0.18, -0.22],
      [0.045, 0.21, 0.045],
      'shell',
    ),
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.19, 0.29, -0.235],
      [0.105, 0.085, 0.11],
      'shell',
      undefined,
      'glass',
      true,
    ),
  );
  for (const finger of [-1, 1])
    parts.push(
      s(
        'pincer' + n + finger,
        'ivory',
        [finger * 0.085, 0, -0.12],
        [0.17, 0.3, 0.08],
        [
          [-0.5, 0.5],
          [0.45, 0.5],
          [0.5, -0.15],
          [0.12, -0.5],
          [-0.1, -0.2],
          [-0.12, 0.12],
          [-0.5, 0.12],
        ],
        'claw' + n,
        [Math.PI / 2, 0, finger < 0 ? Math.PI : 0],
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      ...linkage(
        'leg' + n + i,
        [side * 0.26, -0.02, 0.02 + i * 0.1],
        [side * (0.49 + i * 0.035), -0.1, 0.18 + i * 0.1],
        [side * (0.57 + i * 0.04), -0.35, 0.12 + i * 0.15],
        0.055,
        'shell',
      ),
    );
}
export const clips = {
  attack: action('cannon', [0, 0, 0], [0, 0, 0.11]),
  skill: {
    tracks: [
      ...action('armL', [0, -0.28, 0]).tracks,
      ...action('armR', [0, 0.28, 0]).tracks,
      ...action('cannon', [0, 0, 0], [0, 0, 0.15]).tracks,
    ],
  },
};
