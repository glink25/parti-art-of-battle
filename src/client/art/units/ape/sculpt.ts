import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.62, 0.08], [0.4, 0.35, 0.3], armour),
  s('torso', 'primary', [0, 0.28, -0.025], [0.67, 0.43, 0.4], armour, 'body'),
  s(
    'chest',
    'accent',
    [0, 0.015, -0.225],
    [0.47, 0.22, 0.05],
    chevron,
    'torso',
    undefined,
    'brass',
  ),
  q('core', 'torus', 'dark', [0, -0.03, -0.26], [0.22, 0.22, 0.1], 'torso'),
  q(
    'coreLight',
    'sphere',
    'energy',
    [0, -0.03, -0.28],
    [0.13, 0.13, 0.06],
    'torso',
    undefined,
    'glass',
    true,
  ),
  s('head', 'secondary', [0, 0.3, -0.13], [0.29, 0.25, 0.28], armour, 'torso'),
  s('brow', 'primary', [0, 0.035, -0.16], [0.34, 0.08, 0.08], chevron, 'head'),
  q(
    'eyes',
    'roundedBox',
    'energy',
    [0, -0.02, -0.174],
    [0.21, 0.038, 0.025],
    'head',
    undefined,
    'glass',
    true,
  ),
  s('jaw', 'ivory', [0, -0.1, -0.12], [0.23, 0.13, 0.15], armour, 'head'),
  s('reactorPack', 'dark', [0, 0.04, 0.25], [0.35, 0.32, 0.17], armour, 'torso'),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...linkage(
      'leg' + n,
      [side * 0.14, -0.08, 0],
      [side * 0.23, -0.22, 0.045],
      [side * 0.27, -0.39, -0.06],
      0.18,
      'body',
    ),
    s('foot' + n, 'primary', [0, -0.015, -0.065], [0.25, 0.09, 0.32], armour, 'leg' + n + 'End'),
    ...linkage(
      'arm' + n,
      [side * 0.39, 0.1, 0],
      [side * 0.55, -0.13, -0.04],
      [side * 0.62, -0.49, -0.2],
      0.23,
      'torso',
    ),
    s('shoulder' + n, 'primary', [0, 0.01, 0], [0.3, 0.24, 0.34], armour, 'arm' + n),
    s('fist' + n, 'secondary', [0, -0.055, -0.025], [0.3, 0.28, 0.32], armour, 'arm' + n + 'End'),
    s('gauntlet' + n, 'primary', [0, 0.04, -0.13], [0.33, 0.25, 0.12], chevron, 'fist' + n),
  );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'knuckle' + n + i,
        'cylinder',
        'accent',
        [(i - 1) * 0.09, -0.04, -0.19],
        [0.075, 0.11, 0.075],
        'fist' + n,
        [Math.PI / 2, 0, 0],
        'brass',
      ),
    );
  for (let i = 0; i < 3; i++)
    parts.push(
      q(
        'vent' + n + i,
        'roundedBox',
        'accent',
        [side * 0.11, (i - 1) * 0.075, 0.345],
        [0.08, 0.025, 0.035],
        'torso',
      ),
    );
}
export const clips = {
  attack: action('armR', [-0.65, 0, -0.12]),
  skill: {
    tracks: [...action('armL', [-0.9, 0, 0.12]).tracks, ...action('armR', [-0.9, 0, -0.12]).tracks],
  },
};
