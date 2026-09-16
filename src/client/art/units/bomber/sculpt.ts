import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Broad payload aircraft: swept shoulders, separate engine nacelles and ventral bomb racks.
export const parts: ArtPart[] = [
  s(
    'fuselage',
    'primary',
    [0, 0.91, 0],
    [0.34, 0.98, 0.22],
    [
      [-0.12, -0.5],
      [0.12, -0.5],
      [0.5, -0.13],
      [0.4, 0.35],
      [0.15, 0.5],
      [-0.15, 0.5],
      [-0.4, 0.35],
      [-0.5, -0.13],
    ],
    undefined,
    [Math.PI / 2, 0, 0],
  ),
  s('spine', 'ivory', [0, 0, -0.12], [0.065, 0.72, 0.045], armour, 'fuselage'),
  s(
    'cockpit',
    'dark',
    [0, -0.25, -0.14],
    [0.21, 0.33, 0.085],
    [
      [-0.25, -0.5],
      [0.25, -0.5],
      [0.5, 0.3],
      [0.35, 0.5],
      [-0.35, 0.5],
      [-0.5, 0.3],
    ],
    'fuselage',
    undefined,
    'glass',
  ),
  s('canopyBrace', 'accent', [0, -0.24, -0.19], [0.018, 0.31, 0.018], armour, 'fuselage'),
  q(
    'noseLamp',
    'sphere',
    'energy',
    [0, -0.45, -0.025],
    [0.08, 0.065, 0.08],
    'fuselage',
    undefined,
    'glass',
    true,
  ),
  s(
    'tailplane',
    'secondary',
    [0, 0.43, -0.02],
    [0.67, 0.24, 0.045],
    [
      [-0.5, 0.5],
      [0.5, 0.5],
      [0.3, -0.5],
      [-0.3, -0.5],
    ],
    'fuselage',
  ),
  s(
    'rudder',
    'primary',
    [0, 0.39, -0.22],
    [0.26, 0.28, 0.055],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.4, 0.45],
      [0, 0.5],
    ],
    'fuselage',
    [0, Math.PI / 2, 0],
  ),
];
// The hull joint is rotated into the planform plane; wing descendants use its local XY.
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    s(
      'wing' + n,
      'primary',
      [side * 0.12, 0, 0],
      [0.72, 0.59, 0.065],
      [
        [0, -0.5],
        [side * 0.85, 0.12],
        [side, 0.42],
        [side * 0.85, 0.5],
        [0, 0.16],
      ],
      'fuselage',
    ),
    s(
      'flap' + n,
      'secondary',
      [side * 0.46, 0.18, -0.035],
      [0.5, 0.13, 0.025],
      [
        [-side * 0.5, -0.5],
        [side * 0.5, 0.1],
        [side * 0.43, 0.5],
        [-side * 0.5, 0.5],
      ],
      'fuselage',
    ),
    s('stripe' + n, 'ivory', [side * 0.48, 0.045, -0.044], [0.07, 0.26, 0.015], armour, 'fuselage'),
    q(
      'engine' + n,
      'capsule',
      'secondary',
      [side * 0.39, 0.02, 0.01],
      [0.2, 0.55, 0.2],
      'fuselage',
    ),
    q(
      'intake' + n,
      'torus',
      'accent',
      [side * 0.39, -0.255, 0.01],
      [0.19, 0.19, 0.12],
      'fuselage',
      [Math.PI / 2, 0, 0],
      'brass',
    ),
    q(
      'intakeDark' + n,
      'cylinder',
      'dark',
      [side * 0.39, -0.245, 0.01],
      [0.14, 0.02, 0.14],
      'fuselage',
    ),
    q('exhaust' + n, 'torus', 'dark', [side * 0.39, 0.29, 0.01], [0.18, 0.18, 0.1], 'fuselage', [
      Math.PI / 2,
      0,
      0,
    ]),
    q(
      'exhaustGlow' + n,
      'sphere',
      'energy',
      [side * 0.39, 0.3, 0.01],
      [0.11, 0.025, 0.11],
      'fuselage',
      undefined,
      'glass',
      true,
    ),
  );
  for (let i = 0; i < 2; i++) {
    const bomb = 'bomb' + n + i;
    parts.push(
      q(
        bomb,
        'capsule',
        'secondary',
        [side * (0.18 + i * 0.13), 0.07, 0.19],
        [0.11, 0.34, 0.11],
        'fuselage',
      ),
      q(
        bomb + 'Band',
        'cylinder',
        'accent',
        [0, -0.025, 0],
        [0.12, 0.06, 0.12],
        bomb,
        undefined,
        'brass',
      ),
      s(bomb + 'Fin', 'ivory', [0, 0.13, 0], [0.18, 0.11, 0.025], chevron, bomb),
      s(bomb + 'Rack', 'dark', [0, 0, -0.095], [0.04, 0.16, 0.1], armour, bomb),
    );
  }
}
export const clips = {
  attack: action('fuselage', [0.035, 0, 0], [0, 0, 0.06]),
  skill: {
    tracks: [
      ...action('bombL0', [0, 0, 0], [0, 0, 0.2]).tracks,
      ...action('bombR0', [0, 0, 0], [0, 0, 0.2]).tracks,
    ],
  },
};
