import { flesh as v } from '../../core/organic';
import { detail as q, plate as s, chevron } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'trunk',
    'primary',
    [0, 0.64, 0],
    [
      [0, -0.36, 0, 0.18],
      [-0.07, -0.08, 0, 0.24],
      [0.04, 0.25, 0.01, 0.22],
      [0, 0.57, 0, 0.16],
    ],
    undefined,
    [1, 1, 0.8],
    'wood',
  ),
  v(
    'brow',
    'secondary',
    [0, 1.15, -0.18],
    [
      [-0.22, 0.02, 0, 0.06],
      [-0.1, 0, -0.04, 0.07],
      [0, 0.05, 0, 0.055],
      [0.15, 0, 0, 0.07],
      [0.24, 0.06, 0.02, 0.025],
    ],
    undefined,
    [1, 1, 1],
    'wood',
  ),
  v(
    'jaw',
    'primary',
    [0, 0.92, -0.17],
    [
      [-0.17, 0.04, 0, 0.07],
      [0, -0.08, -0.05, 0.11],
      [0.18, 0.05, 0, 0.06],
    ],
    undefined,
    [1, 1, 1],
    'wood',
  ),
  q(
    'heart',
    'sphere',
    'energy',
    [0, 0.76, -0.2],
    [0.16, 0.23, 0.08],
    undefined,
    undefined,
    'glass',
    true,
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.11, 1.1, -0.226],
      [0.085, 0.04, 0.025],
      undefined,
      undefined,
      'glass',
      true,
    ),
    v(
      'arm' + n,
      'primary',
      [side * 0.16, 1.05, 0],
      [
        [0, 0, 0, 0.13],
        [side * 0.27, -0.06, 0, 0.13],
        [side * 0.4, -0.27, -0.12, 0.105],
        [side * 0.46, -0.39, -0.2, 0.07],
      ],
      undefined,
      [1, 1, 1],
      'wood',
    ),
    v(
      'bough' + n,
      'primary',
      [side * 0.04, 1.15, 0.02],
      [
        [0, 0, 0, 0.13],
        [side * 0.24, 0.23, 0.02, 0.11],
        [side * 0.53, 0.35, 0.02, 0.06],
        [side * 0.7, 0.53, 0, 0.01],
      ],
      undefined,
      [1, 1, 1],
      'wood',
    ),
  );
  for (let i = 0; i < 3; i++) {
    parts.push(
      v(
        'root' + n + i,
        'primary',
        [side * 0.09, 0.39, (i - 1) * 0.1],
        [
          [0, 0, 0, 0.11],
          [side * (0.2 + i * 0.04), -0.11, (i - 1) * 0.17, 0.08],
          [side * (0.37 + i * 0.04), -0.2, (i - 1) * 0.28, 0.03],
        ],
        undefined,
        [1, 1, 1],
        'wood',
      ),
      v(
        'finger' + n + i,
        'primary',
        [side * 0.46, -0.37, -0.2],
        [
          [0, 0, 0, 0.04],
          [side * (0.05 + i * 0.04), -0.11, -0.02, 0.034],
          [side * (0.02 + i * 0.04), -0.16, -0.12, 0.01],
        ],
        'arm' + n,
        [1, 1, 1],
        'wood',
      ),
    );
  }
  for (let i = 0; i < 5; i++)
    parts.push(
      v(
        'crown' + n + i,
        'secondary',
        [side * (0.08 + i * 0.135), 0.37 + Math.sin(i * 0.8) * 0.14, 0],
        [
          [0, -0.04, 0, 0.12],
          [side * 0.035, 0.1, 0, 0.2],
          [side * 0.08, 0.22, 0, 0.11],
          [side * 0.12, 0.29, 0, 0.008],
        ],
        'bough' + n,
        [1, 0.7, 0.8],
        'fur',
      ),
    );
}
for (let i = 0; i < 5; i++)
  parts.push(
    v(
      'bark' + i,
      'secondary',
      [(i - 2) * 0.075, 0.49, -0.18],
      [
        [0, 0, 0, 0.012],
        [0.015, 0.2, -0.04, 0.018],
        [-0.015, 0.4, -0.02, 0.009],
      ],
      undefined,
      [1, 1, 1],
      'wood',
    ),
  );
export const clips = {
  attack: action('armR', [-0.55, 0, -0.25]),
  skill: {
    tracks: [...action('boughL', [0, 0, 0.18]).tracks, ...action('boughR', [0, 0, -0.18]).tracks],
  },
};
