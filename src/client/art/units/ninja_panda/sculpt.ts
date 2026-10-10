import { flesh as v } from '../../core/organic';
import { detail as q, plate as s, chevron } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'ivory',
    [0, 0.7, 0],
    [
      [0, -0.27, 0, 0.19],
      [0, -0.12, 0, 0.3],
      [0, 0.15, 0, 0.3],
      [0, 0.31, 0, 0.19],
    ],
    undefined,
    [1, 1, 0.82],
  ),
  q('head', 'sphere', 'ivory', [0, 1.22, -0.06], [0.56, 0.49, 0.48], undefined, undefined, 'fur'),
  q('muzzle', 'sphere', 'ivory', [0, -0.065, -0.22], [0.32, 0.18, 0.17], 'head', undefined, 'fur'),
  q('nose', 'sphere', 'dark', [0, -0.02, -0.3], [0.11, 0.07, 0.055], 'head', undefined, 'fur'),
  v(
    'mouth',
    'dark',
    [0, -0.1, -0.294],
    [
      [-0.075, 0, 0, 0.009],
      [0, -0.015, 0, 0.01],
      [0.075, 0, 0, 0.009],
    ],
    'head',
  ),
  s(
    'sash',
    'accent',
    [0, 0.52, -0.245],
    [0.53, 0.12, 0.045],
    chevron,
    undefined,
    undefined,
    'cloth',
  ),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'ear' + n,
      'sphere',
      'dark',
      [side * 0.23, 0.19, 0],
      [0.2, 0.2, 0.13],
      'head',
      undefined,
      'fur',
    ),
    q(
      'innerEar' + n,
      'sphere',
      'secondary',
      [side * 0.23, 0.19, -0.065],
      [0.105, 0.11, 0.018],
      'head',
      undefined,
      'fur',
    ),
    q(
      'patch' + n,
      'sphere',
      'dark',
      [side * 0.14, 0.008, -0.204],
      [0.17, 0.2, 0.065],
      'head',
      [0, 0, side * 0.35],
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'ivory',
      [side * 0.13, 0.023, -0.24],
      [0.055, 0.055, 0.022],
      'head',
      undefined,
      'glass',
    ),
    q(
      'pupil' + n,
      'sphere',
      'dark',
      [side * 0.125, 0.023, -0.253],
      [0.027, 0.033, 0.012],
      'head',
      undefined,
      'glass',
    ),
  );
}
parts.push(
  s('scarf', 'accent', [0, 1.02, -0.03], [0.6, 0.12, 0.47], chevron, undefined, undefined, 'cloth'),
  s(
    'scarfTail',
    'accent',
    [0.3, 1.05, 0.15],
    [0.65, 0.22, 0.04],
    [
      [-0.5, -0.2],
      [-0.2, 0.2],
      [0.15, 0.5],
      [0.5, 0.3],
      [0.35, -0.1],
      [0.5, -0.5],
      [0, -0.3],
    ],
    undefined,
    [0, -0.5, 0.4],
    'cloth',
  ),
);
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'leg' + n,
      'dark',
      [side * 0.18, 0.56, 0.04],
      [
        [0, 0, 0, 0.13],
        [side * 0.17, -0.13, 0.05, 0.13],
        [side * 0.2, -0.3, -0.1, 0.085],
      ],
    ),
    q(
      'foot' + n,
      'sphere',
      'dark',
      [side * 0.38, 0.22, -0.13],
      [0.25, 0.12, 0.33],
      undefined,
      undefined,
      'fur',
    ),
    v(
      'arm' + n,
      'dark',
      [side * 0.27, 0.94, 0],
      [
        [0, 0, 0, 0.13],
        [side * 0.17, -0.17, -0.07, 0.105],
        [side * 0.28, -0.13, -0.26, 0.08],
      ],
    ),
    q(
      'hand' + n,
      'sphere',
      'dark',
      [side * 0.28, -0.13, -0.26],
      [0.17, 0.17, 0.17],
      'arm' + n,
      undefined,
      'fur',
    ),
    q(
      'grip' + n,
      'cylinder',
      'secondary',
      [0, 0, 0],
      [0.055, 0.26, 0.055],
      'hand' + n,
      undefined,
      'cloth',
    ),
    q('guard' + n, 'roundedBox', 'accent', [0, 0.14, 0], [0.22, 0.04, 0.1], 'hand' + n),
    s(
      'blade' + n,
      'ivory',
      [0, 0.14, 0],
      [0.16, 0.62, 0.035],
      [
        [-0.5, 0],
        [0.2, 0],
        [0.4, 0.4],
        [0.5, 0.8],
        [0.2, 1],
        [0.03, 0.56],
        [-0.3, 0.3],
      ],
      'hand' + n,
      [0, 0, -side * 0.55],
      'steel',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'wrap' + n + i,
        'roundedBox',
        'ivory',
        [side * 0.34, 0.37 + i * 0.037, -0.04],
        [0.17, 0.024, 0.18],
        undefined,
        [0, 0, side * 0.22],
        'cloth',
      ),
    );
}
parts.push(
  q(
    'seal',
    'sphere',
    'energy',
    [0, 0.14, -0.22],
    [0.075, 0.085, 0.025],
    'head',
    undefined,
    'glass',
    true,
  ),
);
export const clips = {
  attack: action('armR', [-0.7, 0.2, -0.65]),
  skill: {
    tracks: [
      ...action('armL', [-0.6, -0.4, 0.7]).tracks,
      ...action('scarfTail', [0, 0.5, 0.3]).tracks,
    ],
  },
};
