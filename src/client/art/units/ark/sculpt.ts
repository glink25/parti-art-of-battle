import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Long flight deck, asymmetric bridge, open side hangars and four lift engines.
export const parts: ArtPart[] = [
  s(
    'hull',
    'secondary',
    [0, 0.82, 0],
    [0.69, 1.25, 0.29],
    [
      [-0.28, -0.5],
      [0.28, -0.5],
      [0.5, -0.24],
      [0.44, 0.43],
      [0.28, 0.5],
      [-0.28, 0.5],
      [-0.44, 0.43],
      [-0.5, -0.24],
    ],
    undefined,
    [Math.PI / 2, 0, 0],
  ),
  s(
    'deck',
    'primary',
    [0, 0, -0.18],
    [0.71, 1.3, 0.065],
    [
      [-0.3, -0.5],
      [0.3, -0.5],
      [0.5, -0.27],
      [0.5, 0.4],
      [0.32, 0.5],
      [-0.32, 0.5],
      [-0.5, 0.4],
      [-0.5, -0.27],
    ],
    'hull',
  ),
  s('runway', 'dark', [-0.075, -0.01, -0.221], [0.28, 1.08, 0.014], armour, 'hull'),
  s('bridge', 'ivory', [0.23, 0.24, -0.34], [0.2, 0.34, 0.21], armour, 'hull'),
  s(
    'bridgeGlass',
    'dark',
    [0.23, 0.12, -0.36],
    [0.21, 0.1, 0.15],
    armour,
    'hull',
    undefined,
    'glass',
  ),
  q('mast', 'cylinder', 'secondary', [0.23, 1.38, 0.27], [0.025, 0.29, 0.025]),
  s('radar', 'accent', [0, 0.17, 0], [0.24, 0.11, 0.035], armour, 'mast'),
  ...barrel('turret', [0, 0.04, 0], 'turretMount'),
  q('turretMount', 'cylinder', 'secondary', [-0.22, 1.03, -0.36], [0.18, 0.08, 0.18]),
  s(
    'drone',
    'ivory',
    [-0.075, -0.27, -0.27],
    [0.29, 0.2, 0.045],
    [
      [-0.5, 0.5],
      [0, -0.5],
      [0.5, 0.5],
      [0, 0.22],
    ],
    'hull',
  ),
  q(
    'droneCore',
    'sphere',
    'energy',
    [0, -0.005, -0.035],
    [0.065, 0.1, 0.03],
    'drone',
    undefined,
    'glass',
    true,
  ),
];
for (let i = 0; i < 5; i++)
  parts.push(
    s(
      'runwayMark' + i,
      'ivory',
      [-0.075, -0.43 + i * 0.2, -0.234],
      [0.025, 0.08, 0.009],
      armour,
      'hull',
    ),
  );
for (const side of [-1, 1]) {
  for (const z of [-0.3, 0.34]) {
    const n = 'pod' + side + z;
    parts.push(
      q(n, 'capsule', 'primary', [side * 0.43, 0.7, z], [0.24, 0.3, 0.28]),
      q(n + 'Ring', 'torus', 'accent', [0, -0.16, 0], [0.22, 0.22, 0.1], n, [Math.PI / 2, 0, 0]),
      q(
        n + 'Glow',
        'cylinder',
        'energy',
        [0, -0.18, 0],
        [0.15, 0.035, 0.15],
        n,
        undefined,
        'glass',
        true,
      ),
    );
  }
  parts.push(
    s(
      'hangar' + side,
      'ivory',
      [side * 0.358, 0.83, 0.06],
      [0.68, 0.18, 0.035],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5],
        [-0.5, 0.5],
      ],
      undefined,
      [0, Math.PI / 2, 0],
      'enamel',
      [
        [
          [-0.36, -0.3],
          [-0.36, 0.3],
          [0.36, 0.3],
          [0.36, -0.3],
        ],
      ],
    ),
    s(
      'hangarDark' + side,
      'dark',
      [side * 0.33, 0.83, 0.06],
      [0.6, 0.13, 0.02],
      armour,
      undefined,
      [0, Math.PI / 2, 0],
    ),
  );
  for (let i = 0; i < 5; i++)
    parts.push(
      q(
        'deckLamp' + side + i,
        'sphere',
        'energy',
        [side * 0.29, 0.02 + (i - 2) * 0.21, -0.224],
        [0.03, 0.03, 0.022],
        'hull',
        undefined,
        'glass',
        true,
      ),
    );
}
export const clips = {
  attack: action('turret', [0, 0, 0], [0, 0, 0.06]),
  skill: action('drone', [0, 0, 0], [0, -0.37, -0.14]),
};
