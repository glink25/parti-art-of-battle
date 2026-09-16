import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('core', 'primary', [0, 0.93, 0], [0.4, 0.34, 0.36], armour),
  s('face', 'ivory', [0, 0.015, -0.2], [0.33, 0.23, 0.07], armour, 'core'),
  q('eyeRim', 'torus', 'secondary', [0, 0.02, -0.26], [0.19, 0.19, 0.085], 'core'),
  q(
    'eye',
    'sphere',
    'energy',
    [0, 0.02, -0.27],
    [0.13, 0.13, 0.065],
    'core',
    undefined,
    'glass',
    true,
  ),
  s('pack', 'secondary', [0, 0.04, 0.24], [0.28, 0.3, 0.16], armour, 'core'),
  q('rotor', 'torus', 'ivory', [0, -0.27, 0.015], [0.46, 0.46, 0.14], 'core', [Math.PI / 2, 0, 0]),
  q('turbine', 'cylinder', 'secondary', [0, -0.22, 0.015], [0.25, 0.22, 0.25], 'core'),
  q(
    'lift',
    'cylinder',
    'energy',
    [0, -0.345, 0.015],
    [0.19, 0.05, 0.19],
    'core',
    undefined,
    'glass',
    true,
  ),
  q('antenna', 'cylinder', 'secondary', [0.13, 0.29, 0.08], [0.025, 0.27, 0.025], 'core'),
  q(
    'beacon',
    'sphere',
    'accent',
    [0.13, 0.43, 0.08],
    [0.07, 0.07, 0.07],
    'core',
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
      [side * 0.22, 0.02, 0],
      [side * 0.46, -0.06, -0.02],
      [side * 0.52, -0.3, -0.15],
      0.09,
      'core',
    ),
    q('wrist' + n, 'cylinder', 'accent', [0, -0.025, 0], [0.16, 0.12, 0.16], 'arm' + n + 'End'),
    ...linkage(
      'rear' + n,
      [side * 0.16, 0.04, 0.19],
      [side * 0.3, 0.18, 0.29],
      [side * 0.4, 0.27, 0.09],
      0.065,
      'core',
    ),
    q(
      'spool' + n,
      'cylinder',
      'accent',
      [side * 0.24, 0, 0.24],
      [0.18, 0.1, 0.18],
      'core',
      [0, 0, Math.PI / 2],
      'brass',
    ),
  );
  for (const finger of [-1, 1])
    parts.push(
      s(
        'claw' + n + finger,
        'ivory',
        [finger * 0.075, -0.16, 0],
        [0.13, 0.25, 0.07],
        [
          [-0.5, 0.5],
          [0.15, 0.5],
          [0.45, -0.28],
          [0, -0.5],
          [-0.45, -0.12],
        ],
        'arm' + n + 'End',
        [0, 0, -finger * 0.25],
      ),
    );
}
parts.push(
  q('welder', 'cylinder', 'secondary', [0, 0.08, -0.06], [0.065, 0.28, 0.065], 'rearREnd', [
    Math.PI / 2,
    0,
    0,
  ]),
  q(
    'tip',
    'sphere',
    'energy',
    [0, 0.08, -0.21],
    [0.07, 0.07, 0.07],
    'rearREnd',
    undefined,
    'glass',
    true,
  ),
  s(
    'wrench',
    'ivory',
    [0, 0.11, 0],
    [0.18, 0.28, 0.065],
    [
      [-0.5, 0.5],
      [-0.23, 0.5],
      [-0.23, 0.1],
      [0.23, 0.1],
      [0.23, 0.5],
      [0.5, 0.5],
      [0.5, -0.05],
      [0.16, -0.3],
      [0.16, -0.5],
      [-0.16, -0.5],
      [-0.16, -0.3],
      [-0.5, -0.05],
    ],
    'rearLEnd',
  ),
);
export const clips = {
  attack: action('rearR', [-0.3, 0.1, 0]),
  skill: {
    tracks: [...action('armL', [-0.3, 0, -0.25]).tracks, ...action('armR', [-0.3, 0, 0.25]).tracks],
  },
};
