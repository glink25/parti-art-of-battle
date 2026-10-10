import { flesh as v } from '../../core/organic';
import { detail as q, plate as s, chevron } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'ivory',
    [0, 0.56, 0],
    [
      [0, -0.27, 0, 0.19],
      [0, -0.12, 0, 0.27],
      [0, 0.15, 0, 0.27],
      [0, 0.31, 0, 0.19],
    ],
    undefined,
    [1, 1, 0.82],
  ),
  q('head', 'sphere', 'ivory', [0, 0.96, -0.06], [0.56, 0.49, 0.48], undefined, undefined, 'fur'),
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
    [0, 0.38000000000000006, -0.245],
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
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    v(
      'leg' + n,
      'dark',
      [side * 0.15, 0.4, 0],
      [
        [0, 0, 0, 0.12],
        [side * 0.1, -0.09, 0, 0.11],
        [side * 0.14, -0.17, -0.06, 0.075],
      ],
    ),
    q(
      'foot' + n,
      'sphere',
      'dark',
      [side * 0.29, 0.22, -0.1],
      [0.22, 0.12, 0.29],
      undefined,
      undefined,
      'fur',
    ),
    v(
      'arm' + n,
      'dark',
      [side * 0.24, 0.77, 0],
      [
        [0, 0, 0, 0.12],
        [side * 0.17, -0.12, -0.1, 0.1],
        [side * 0.12, -0.03, -0.31, 0.095],
      ],
    ),
    q(
      'fist' + n,
      'sphere',
      'ivory',
      [side * 0.12, -0.03, -0.32],
      [0.2, 0.17, 0.2],
      'arm' + n,
      undefined,
      'cloth',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'wrap' + n + i,
        'roundedBox',
        'accent',
        [side * 0.12, -0.075 + i * 0.04, -0.402],
        [0.14, 0.013, 0.018],
        'arm' + n,
        undefined,
        'cloth',
      ),
    );
}
parts.push(
  s(
    'apron',
    'secondary',
    [0, 0.39, -0.19],
    [0.29, 0.28, 0.04],
    chevron,
    undefined,
    undefined,
    'cloth',
  ),
);
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
  attack: action('armR', [-0.5, 0, -0.18], [0, 0, -0.15]),
  skill: action('armL', [-0.2, 0, 0.3]),
};
