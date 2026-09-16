import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// A fixed plinth and exposed reactor with four hinged shield petals.
export const parts: ArtPart[] = [
  s('base', 'secondary', [0, 0.24, 0], [0.65, 0.14, 0.65], armour),
  s('footing', 'primary', [0, 0.105, 0], [0.49, 0.12, 0.49], armour, 'base'),
  q('column', 'cylinder', 'dark', [0, 0.26, 0], [0.27, 0.3, 0.27], 'base'),
  q(
    'lowerRing',
    'torus',
    'accent',
    [0, 0.3, 0],
    [0.36, 0.36, 0.1],
    'base',
    [Math.PI / 2, 0, 0],
    'brass',
  ),
  q(
    'upperRing',
    'torus',
    'accent',
    [0, 0.96, 0],
    [0.38, 0.38, 0.1],
    'base',
    [Math.PI / 2, 0, 0],
    'brass',
  ),
  q(
    'reactor',
    'capsule',
    'energy',
    [0, 0.67, 0],
    [0.22, 0.46, 0.22],
    'base',
    undefined,
    'glass',
    true,
  ),
  s('cap', 'primary', [0, 1.04, 0], [0.33, 0.12, 0.33], armour, 'base'),
  ...barrel('cannon', [0, 0.94, -0.23], 'base'),
];
for (let i = 0; i < 4; i++) {
  const a = (i * Math.PI) / 2,
    n = 'hinge' + i;
  parts.push(
    q(
      n,
      'cylinder',
      'accent',
      [Math.sin(a) * 0.3, 0.29, Math.cos(a) * 0.3],
      [0.14, 0.18, 0.14],
      'base',
      [0, a, 0],
      'brass',
    ),
    s(
      'panel' + i,
      'primary',
      [0, 0.34, 0],
      [0.25, 0.72, 0.095],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.15],
        [0.22, 0.5],
        [-0.22, 0.5],
        [-0.5, 0.15],
      ],
      n,
    ),
    s('inset' + i, 'secondary', [0, 0.01, -0.065], [0.17, 0.51, 0.035], chevron, 'panel' + i),
    s(
      'seam' + i,
      'accent',
      [0, 0.02, -0.09],
      [0.038, 0.39, 0.02],
      armour,
      'panel' + i,
      undefined,
      'brass',
    ),
  );
  for (let j = 0; j < 3; j++)
    parts.push(
      q(
        'vent' + i + j,
        'roundedBox',
        'dark',
        [0, -0.13 + j * 0.08, 0.059],
        [0.16, 0.025, 0.015],
        'panel' + i,
      ),
    );
}
export const clips = {
  attack: action('cannon', [0, 0, 0], [0, 0, 0.1]),
  skill: {
    tracks: [
      ...action('hinge0', [0.65, 0, 0]).tracks,
      ...action('hinge1', [0.65, 0, 0]).tracks,
      ...action('hinge2', [0.65, 0, 0]).tracks,
      ...action('hinge3', [0.65, 0, 0]).tracks,
      ...action('reactor', [0, 0.8, 0], [0, 0.08, 0]).tracks,
    ],
  },
};
