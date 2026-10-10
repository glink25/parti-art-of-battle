import { flesh as v } from '../../core/organic';
import { detail as q, plate as s, chevron } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'stem',
    'secondary',
    [0, 0.2, 0],
    [
      [0, 0, 0, 0.085],
      [-0.14, 0.24, 0.02, 0.095],
      [0.1, 0.52, 0, 0.12],
      [-0.04, 0.8, 0, 0.095],
      [0, 1.04, 0, 0.04],
    ],
    undefined,
    [1, 1, 1],
    'wood',
  ),
  v(
    'braid',
    'primary',
    [0, 0.2, 0.02],
    [
      [0.08, 0, 0, 0.045],
      [0.12, 0.22, -0.02, 0.055],
      [-0.1, 0.46, -0.06, 0.07],
      [0.09, 0.72, 0.03, 0.055],
      [0, 0.96, 0, 0.02],
    ],
    undefined,
    [1, 1, 1],
    'wood',
  ),
  q('face', 'sphere', 'primary', [0, 1.18, -0.06], [0.24, 0.28, 0.2], undefined, undefined, 'wood'),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eye' + n,
      'sphere',
      'energy',
      [side * 0.065, 1.2, -0.155],
      [0.05, 0.065, 0.025],
      undefined,
      undefined,
      'glass',
      true,
    ),
    v(
      'root' + n,
      'secondary',
      [0, 0.3, 0],
      [
        [0, 0, 0, 0.06],
        [side * 0.19, -0.08, -0.03, 0.05],
        [side * 0.32, -0.115, -0.15, 0.025],
      ],
      undefined,
      [1, 1, 1],
      'wood',
    ),
    v(
      'whip' + n,
      'secondary',
      [side * 0.06, 0.95, 0.02],
      [
        [0, 0, 0, 0.065],
        [side * 0.23, -0.1, 0, 0.06],
        [side * 0.44, 0.04, -0.04, 0.045],
        [side * 0.51, 0.29, -0.04, 0.025],
        [side * 0.42, 0.38, -0.04, 0.003],
      ],
      undefined,
      [1, 1, 1],
      'wood',
    ),
  );
  for (let i = 0; i < 4; i++)
    parts.push(
      s(
        'leaf' + n + i,
        'secondary',
        [side * (0.11 + i * 0.06), 1.22 + i * 0.055, 0.015],
        [0.18, 0.32, 0.055],
        [
          [0, -0.5],
          [-0.5, 0],
          [-0.32, 0.28],
          [0, 0.5],
          [0.4, 0.18],
          [0.35, -0.15],
        ],
        undefined,
        [0, side * 0.35, -side * (0.5 + i * 0.18)],
        'fur',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      s(
        'thorn' + n + i,
        'ivory',
        [side * (0.15 + i * 0.13), -0.06 + i * 0.05, -0.01],
        [0.08, 0.12, 0.025],
        [
          [0, -0.5],
          [-0.5, 0],
          [0, 0.5],
          [0.3, -0.5],
        ],
        'whip' + n,
        [0, 0, -side * 0.6],
        'wood',
      ),
    );
  parts.push(
    s(
      'hipLeaf' + n,
      'secondary',
      [side * 0.13, 0.63, -0.05],
      [0.2, 0.42, 0.05],
      [
        [0, -0.5],
        [-0.45, -0.1],
        [-0.4, 0.2],
        [0, 0.5],
        [0.4, 0.1],
      ],
      undefined,
      [0, side * 0.3, side * 0.6],
      'fur',
    ),
  );
}
export const clips = {
  attack: action('whipR', [-0.2, -0.5, -0.3]),
  skill: action('whipL', [-0.3, 0.5, 0.2]),
};
