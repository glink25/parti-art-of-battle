import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('chassis', 'secondary', [0, 0.67, 0.02], [0.48, 0.3, 0.72], armour),
  s('back', 'primary', [0, 0.13, 0.04], [0.53, 0.64, 0.13], chevron, 'chassis', [
    Math.PI / 2,
    0,
    0,
  ]),
  s('head', 'primary', [0, -0.02, -0.47], [0.32, 0.27, 0.32], armour, 'chassis'),
  s('jaw', 'secondary', [0, -0.12, -0.08], [0.28, 0.07, 0.32], armour, 'head'),
  s('snout', 'dark', [0, -0.025, -0.18], [0.22, 0.12, 0.1], armour, 'head'),
  q('nose', 'roundedBox', 'accent', [0, 0.02, -0.24], [0.1, 0.055, 0.05], 'head'),
  ...barrel('cannonL', [-0.2, 0.24, -0.12], 'chassis'),
  ...barrel('cannonR', [0.2, 0.24, -0.12], 'chassis'),
  ...linkage('tail', [0, 0, 0.36], [0, 0.14, 0.54], [0, 0.3, 0.61], 0.06, 'chassis'),
];
for (const side of [-1, 1]) {
  parts.push(
    s(
      'ear' + side,
      'secondary',
      [side * 0.13, 0.2, 0.02],
      [0.1, 0.25, 0.08],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.2, 0.5],
        [-0.4, 0.25],
      ],
      'head',
    ),
    q(
      'eye' + side,
      'roundedBox',
      'energy',
      [side * 0.105, 0.055, -0.168],
      [0.065, 0.038, 0.035],
      'head',
      undefined,
      'glass',
      true,
    ),
  );
  for (const z of [-0.25, 0.27]) {
    const n = 'leg' + side + z;
    parts.push(
      ...linkage(
        n,
        [side * 0.23, -0.02, z],
        [side * 0.34, -0.22, z + 0.1],
        [side * 0.35, -0.45, z - 0.035],
        0.12,
        'chassis',
      ),
      s(n + 'Foot', 'primary', [0, -0.005, -0.04], [0.19, 0.09, 0.26], armour, n + 'End'),
      q(n + 'Axle', 'cylinder', 'accent', [side * 0.01, 0, 0], [0.15, 0.06, 0.15], n, [
        0,
        0,
        Math.PI / 2,
      ]),
    );
  }
}
export const clips = {
  attack: action('cannonL', [0, 0, 0], [0, 0, 0.11]),
  skill: {
    tracks: [
      ...action('cannonL', [0, 0, 0], [0, 0, 0.13]).tracks,
      ...action('cannonR', [0, 0, 0], [0, 0, 0.13]).tracks,
    ],
  },
};
