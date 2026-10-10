import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 1.01, -0.04],
    [
      [0, 0, -0.55, 0.12],
      [0, 0.035, -0.4, 0.31],
      [0, 0.01, -0.12, 0.34],
      [0, 0, 0.24, 0.23],
      [0, -0.025, 0.49, 0.105],
    ],
    undefined,
    [1, 0.82, 1],
  ),
  v(
    'belly',
    'ivory',
    [0, -0.19, -0.19],
    [
      [0, 0, -0.29, 0.1],
      [0, -0.01, -0.1, 0.22],
      [0, 0.035, 0.2, 0.15],
      [0, 0.06, 0.42, 0.045],
    ],
    'body',
    [1, 0.35, 1],
  ),
  v(
    'jaw',
    'secondary',
    [0, -0.105, -0.45],
    [
      [-0.22, 0, 0.025, 0.014],
      [0, -0.03, -0.12, 0.016],
      [0.22, 0, 0.025, 0.014],
    ],
    'body',
  ),
  v(
    'tail',
    'primary',
    [0, -0.025, 0.47],
    [
      [0, 0, 0, 0.11],
      [0, 0.015, 0.19, 0.075],
      [0, 0.09, 0.34, 0.05],
    ],
    'body',
    [1, 0.7, 1],
  ),
  s(
    'dorsal',
    'secondary',
    [0, 0.23, 0.17],
    [0.23, 0.2, 0.045],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.15, 0.5],
      [-0.15, 0.22],
    ],
    'body',
    [0, Math.PI / 2, 0],
  ),
  q('blowhole', 'sphere', 'dark', [0, 0.27, -0.27], [0.11, 0.025, 0.075], 'body', undefined, 'fur'),
  v(
    'spout',
    'energy',
    [0, 0.29, -0.27],
    [
      [0, 0, 0, 0.017],
      [0, 0.16, 0, 0.014],
      [-0.07, 0.28, 0.005, 0.009],
      [-0.13, 0.24, 0, 0.001],
    ],
    'body',
    [1, 1, 1],
    'glass',
  ),
  v(
    'spoutR',
    'energy',
    [0, 0.41, -0.27],
    [
      [0, 0, 0, 0.012],
      [0.06, 0.13, 0, 0.009],
      [0.13, 0.1, 0, 0.001],
    ],
    'body',
    [1, 1, 1],
    'glass',
  ),
];
parts.find((p) => p.name === 'spout')!.emissive = true;
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'fin' + n,
      'primary',
      [side * 0.25, -0.07, -0.12],
      [
        [0, 0, 0, 0.075],
        [side * 0.17, -0.18, 0.025, 0.13],
        [side * 0.38, -0.45, 0.13, 0.075],
        [side * 0.51, -0.62, 0.22, 0.002],
      ],
      'body',
      [1, 0.3, 1],
    ),
    v(
      'fluke' + n,
      'primary',
      [0, 0.08, 0.33],
      [
        [0, 0, 0, 0.055],
        [side * 0.18, 0.025, 0.025, 0.12],
        [side * 0.35, 0.035, 0.13, 0.07],
        [side * 0.46, 0.045, 0.22, 0.001],
      ],
      'tail',
      [1, 0.23, 1],
    ),
    q(
      'eye' + n,
      'sphere',
      'dark',
      [side * 0.307, 0.005, -0.37],
      [0.05, 0.045, 0.035],
      'body',
      undefined,
      'glass',
    ),
    q(
      'eyeGlint' + n,
      'sphere',
      'ivory',
      [side * 0.323, 0.016, -0.389],
      [0.015, 0.015, 0.012],
      'body',
    ),
  );
}
for (let i = 0; i < 5; i++)
  parts.push(
    v(
      'pleat' + i,
      'secondary',
      [(i - 2) * 0.06, -0.23, -0.37],
      [
        [0, 0, 0, 0.006],
        [0, -0.015, 0.18, 0.006],
        [0, 0.04, 0.38, 0.003],
      ],
      'body',
    ),
  );
export const clips = {
  attack: action('body', [0.12, 0, 0], [0, 0, -0.06]),
  skill: {
    tracks: [
      ...action('tail', [-0.35, 0, 0]).tracks,
      ...action('finL', [0, 0, -0.25]).tracks,
      ...action('finR', [0, 0, 0.25]).tracks,
      ...action('spout', [0, 0, 0], [0, 0.09, 0]).tracks,
      ...action('spoutR', [0, 0, 0], [0, 0.09, 0]).tracks,
    ],
  },
};
