import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  v(
    'body',
    'secondary',
    [0, 0.67, 0.02],
    [
      [0, -0.09, 0.04, 0.13],
      [0, 0.09, 0.03, 0.17],
      [0, 0.22, 0, 0.09],
    ],
  ),
  q('head', 'sphere', 'primary', [0, 0.23, -0.045], [0.51, 0.49, 0.38], 'body', undefined, 'fur'),
  q('sclera', 'sphere', 'ivory', [0, 0.01, -0.18], [0.37, 0.36, 0.16], 'head', undefined, 'glass'),
  q(
    'iris',
    'sphere',
    'energy',
    [0, 0.01, -0.267],
    [0.22, 0.24, 0.06],
    'head',
    undefined,
    'glass',
    true,
  ),
  q('pupil', 'sphere', 'dark', [0, 0.01, -0.301], [0.055, 0.17, 0.024], 'head', undefined, 'glass'),
  q('glint', 'sphere', 'ivory', [-0.035, 0.075, -0.316], [0.04, 0.04, 0.012], 'head'),
];
for (let i = 0; i < 3; i++) {
  const a = (i * Math.PI * 2) / 3,
    x = Math.sin(a),
    z = Math.cos(a);
  parts.push(
    v(
      'leg' + i,
      'secondary',
      [x * 0.1, -0.04, z * 0.1],
      [
        [0, 0, 0, 0.055],
        [x * 0.18, -0.12, z * 0.18, 0.044],
        [x * 0.21, -0.43, z * 0.21, 0.024],
        [x * 0.27, -0.46, z * 0.27, 0.01],
      ],
      'body',
    ),
  );
}
for (const side of [-1, 1]) {
  parts.push(
    s(
      'brow' + side,
      'secondary',
      [side * 0.12, 0.17, -0.135],
      [0.24, 0.14, 0.065],
      chevron,
      'head',
      [0, 0, -side * 0.35],
      'fur',
    ),
    v(
      'antenna' + side,
      'primary',
      [side * 0.15, 0.18, 0.015],
      [
        [0, 0, 0, 0.028],
        [side * 0.04, 0.14, 0, 0.02],
        [side * 0.11, 0.19, -0.045, 0.004],
      ],
      'head',
    ),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'ocellus' + side + i,
        'sphere',
        'energy',
        [side * (0.22 - i * 0.012), 0.02 + i * 0.055, -0.075],
        [0.05, 0.05, 0.04],
        'head',
        undefined,
        'glass',
        true,
      ),
    );
}
export const clips = {
  attack: action('head', [0, 0.12, 0], [0, 0, -0.04]),
  skill: action('head', [-0.12, -0.17, 0], [0, 0.025, -0.035]),
};
