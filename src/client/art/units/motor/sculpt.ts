import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('chassis', 'secondary', [0, 0.48, 0], [0.24, 0.2, 0.72], armour),
  s('tank', 'primary', [0, 0.17, -0.1], [0.32, 0.23, 0.4], armour, 'chassis'),
  s('seat', 'dark', [0, 0.18, 0.2], [0.25, 0.07, 0.3], armour, 'chassis', undefined, 'cloth'),
  q('engine', 'cylinder', 'secondary', [0, -0.02, 0.02], [0.25, 0.3, 0.25], 'chassis', [
    0,
    0,
    Math.PI / 2,
  ]),
  s('fairing', 'primary', [0, 0.19, -0.43], [0.31, 0.34, 0.15], chevron, 'chassis', [-0.25, 0, 0]),
  q(
    'headlight',
    'sphere',
    'ivory',
    [0, 0.24, -0.54],
    [0.16, 0.14, 0.065],
    'chassis',
    undefined,
    'glass',
    true,
  ),
  s(
    'rider',
    'secondary',
    [0, 0.42, 0.1],
    [0.28, 0.34, 0.2],
    armour,
    'chassis',
    [-0.28, 0, 0],
    'cloth',
  ),
  q('helmet', 'sphere', 'primary', [0, 0.26, -0.06], [0.26, 0.27, 0.28], 'rider'),
  s('visor', 'dark', [0, 0.28, -0.19], [0.22, 0.095, 0.04], armour, 'rider', undefined, 'glass'),
  q(
    'goggle',
    'roundedBox',
    'energy',
    [0, 0.28, -0.215],
    [0.17, 0.025, 0.02],
    'rider',
    undefined,
    'glass',
    true,
  ),
  q('handlebar', 'cylinder', 'accent', [0, 0.31, -0.37], [0.045, 0.48, 0.045], 'chassis', [
    0,
    0,
    Math.PI / 2,
  ]),
  ...barrel('nozzle', [0.26, 0.11, -0.35], 'chassis'),
];
for (const z of [-0.46, 0.43]) {
  const n = 'wheel' + z;
  parts.push(
    q(
      n,
      'torus',
      'dark',
      [0, 0.37, z],
      [0.34, 0.34, 0.25],
      undefined,
      [0, Math.PI / 2, 0],
      'cloth',
    ),
    q(
      n + 'Hub',
      'cylinder',
      'accent',
      [0, 0, 0],
      [0.19, 0.23, 0.19],
      n,
      [Math.PI / 2, 0, 0],
      'brass',
    ),
  );
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    parts.push(
      q(
        n + 'Tread' + i,
        'roundedBox',
        'secondary',
        [Math.cos(a) * 0.167, Math.sin(a) * 0.167, 0],
        [0.08, 0.055, 0.25],
        n,
        [0, 0, a],
      ),
    );
  }
}
for (const side of [-1, 1]) {
  parts.push(
    ...linkage(
      'fork' + side,
      [side * 0.12, 0.25, -0.32],
      [side * 0.12, 0.03, -0.41],
      [side * 0.12, -0.11, -0.46],
      0.055,
      'chassis',
    ),
    ...linkage(
      'leg' + side,
      [side * 0.12, 0.31, 0.17],
      [side * 0.23, 0.11, -0.02],
      [side * 0.2, -0.06, 0.07],
      0.1,
      'chassis',
    ),
    ...linkage(
      'arm' + side,
      [side * 0.16, 0.52, 0.02],
      [side * 0.23, 0.39, -0.13],
      [side * 0.21, 0.31, -0.37],
      0.08,
      'chassis',
    ),
    s('boot' + side, 'dark', [0, -0.01, -0.03], [0.12, 0.07, 0.19], armour, 'leg' + side + 'End'),
    q(
      'exhaust' + side,
      'cylinder',
      'secondary',
      [side * 0.2, -0.08, 0.28],
      [0.075, 0.42, 0.075],
      'chassis',
      [Math.PI / 2, 0, 0],
    ),
    q(
      'canister' + side,
      'capsule',
      'accent',
      [side * 0.22, 0.22, 0.31],
      [0.15, 0.3, 0.17],
      'chassis',
    ),
  );
}
export const clips = {
  attack: action('nozzle', [0, 0, 0], [0, 0, 0.07]),
  skill: action('rider', [-0.2, 0, 0]),
};
