import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Floating amphibian with folded hind thighs, webbing and a deeply recessed mouth.
export const parts: ArtPart[] = [
  v(
    'body',
    'primary',
    [0, 0.92, 0.065],
    [
      [0, -0.03, -0.18, 0.15],
      [0, 0, 0.015, 0.31],
      [0, 0.015, 0.26, 0.28],
      [0, -0.035, 0.4, 0.1],
    ],
    undefined,
    [1.15, 0.85, 1],
  ),
  q('throat', 'sphere', 'ivory', [0, -0.16, -0.14], [0.45, 0.27, 0.33], 'body', undefined, 'fur'),
  q('mouth', 'sphere', 'dark', [0, 0, -0.265], [0.53, 0.27, 0.06], 'body', undefined, 'fur'),
  v(
    'upperLip',
    'secondary',
    [0, 0.01, -0.3],
    [
      [-0.25, -0.01, 0, 0.028],
      [-0.16, 0.11, 0, 0.025],
      [0, 0.14, 0, 0.026],
      [0.16, 0.11, 0, 0.025],
      [0.25, -0.01, 0, 0.028],
    ],
    'body',
  ),
  v(
    'jaw',
    'primary',
    [0, -0.07, -0.3],
    [
      [-0.25, 0.045, 0, 0.035],
      [-0.15, -0.045, 0, 0.038],
      [0, -0.07, 0, 0.038],
      [0.15, -0.045, 0, 0.038],
      [0.25, 0.045, 0, 0.035],
    ],
    'body',
  ),
  v(
    'tongue',
    'energy',
    [0, -0.075, -0.305],
    [
      [0, 0, 0, 0.045],
      [0, 0.015, -0.12, 0.035],
      [0, 0.045, -0.2, 0.035],
    ],
    'body',
    [1, 0.55, 1],
    'fur',
  ),
];
parts.find((p) => p.name === 'tongue')!.emissive = true;
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'eyeMound' + n,
      'sphere',
      'primary',
      [side * 0.2, 0.19, -0.14],
      [0.24, 0.27, 0.22],
      'body',
      undefined,
      'fur',
    ),
    q(
      'eye' + n,
      'sphere',
      'accent',
      [0, 0.03, -0.106],
      [0.16, 0.15, 0.055],
      'eyeMound' + n,
      undefined,
      'glass',
    ),
    q(
      'pupil' + n,
      'sphere',
      'dark',
      [0, 0.03, -0.139],
      [0.115, 0.035, 0.018],
      'eyeMound' + n,
      undefined,
      'glass',
    ),
    q('glint' + n, 'sphere', 'ivory', [-0.03, 0.06, -0.151], [0.026, 0.023, 0.012], 'eyeMound' + n),
    v(
      'arm' + n,
      'secondary',
      [side * 0.25, -0.04, -0.13],
      [
        [0, 0, 0, 0.065],
        [side * 0.12, -0.14, -0.02, 0.05],
        [side * 0.15, -0.26, -0.18, 0.03],
      ],
      'body',
    ),
    v(
      'thigh' + n,
      'primary',
      [side * 0.24, -0.02, 0.23],
      [
        [0, 0, 0, 0.13],
        [side * 0.17, -0.08, 0.07, 0.17],
        [side * 0.21, -0.18, 0.01, 0.095],
      ],
      'body',
    ),
    v(
      'shin' + n,
      'secondary',
      [side * 0.43, -0.2, 0.24],
      [
        [0, 0, 0, 0.065],
        [-side * 0.13, -0.11, 0.12, 0.05],
        [side * 0.02, -0.17, 0.23, 0.025],
      ],
      'body',
    ),
  );
  for (const hind of [false, true]) {
    const foot = (hind ? 'hind' : 'fore') + n;
    const pos: [number, number, number] = hind
      ? [side * 0.45, -0.38, 0.47]
      : [side * 0.4, -0.3, -0.31];
    parts.push(
      s(
        foot,
        'primary',
        pos,
        [0.22, 0.2, 0.035],
        [
          [-0.5, 0.5],
          [-0.2, 0.18],
          [0, 0.5],
          [0.18, 0.18],
          [0.5, 0.5],
          [0.28, -0.5],
          [-0.28, -0.5],
        ],
        'body',
        [-Math.PI / 2, 0, 0],
        'fur',
      ),
    );
    for (let i = 0; i < 3; i++)
      parts.push(
        v(
          foot + 'Toe' + i,
          'secondary',
          [(i - 1) * 0.075, 0.06, 0],
          [
            [0, 0, 0, 0.018],
            [(i - 1) * 0.018, 0.1, 0, 0.009],
          ],
          foot,
        ),
      );
  }
  for (let i = 0; i < 4; i++)
    parts.push(
      q(
        'wart' + n + i,
        'sphere',
        'secondary',
        [side * (0.23 - i * 0.014), 0.19, 0.04 + i * 0.07],
        [0.055, 0.05, 0.055],
        'body',
        undefined,
        'fur',
      ),
    );
}
export const clips = {
  attack: action('tongue', [0, 0, 0], [0, 0, -0.18]),
  skill: {
    tracks: [
      ...action('jaw', [-0.3, 0, 0], [0, -0.06, 0]).tracks,
      ...action('tongue', [0, 0, 0], [0, 0, -0.35]).tracks,
      ...action('throat', [0, 0, 0], [0, -0.045, 0]).tracks,
    ],
  },
};
