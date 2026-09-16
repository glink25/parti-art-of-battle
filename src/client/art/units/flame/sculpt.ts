import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb, boots, recoil } from '../../core/infantry';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.8, 0], [0.43, 0.2, 0.33], armour),
  s('torso', 'primary', [0, 0.14, 0], [0.55, 0.43, 0.39], armour, 'body', undefined, 'cloth'),
  s('apron', 'ivory', [0, -0.05, -0.225], [0.4, 0.4, 0.055], chevron, 'torso', undefined, 'cloth'),
  q('head', 'sphere', 'dark', [0, 0.39, 0], [0.3, 0.31, 0.29], 'torso', undefined, 'cloth'),
  s('helmet', 'secondary', [0, 0.12, 0.01], [0.38, 0.22, 0.36], armour, 'head'),
  q('mask', 'roundedBox', 'ivory', [0, -0.06, -0.15], [0.2, 0.13, 0.1], 'head'),
  q('filter', 'cylinder', 'dark', [0, -0.06, -0.24], [0.1, 0.09, 0.1], 'head', [Math.PI / 2, 0, 0]),
  q(
    'visor',
    'roundedBox',
    'energy',
    [0, 0.04, -0.16],
    [0.24, 0.08, 0.028],
    'head',
    undefined,
    'glass',
    true,
  ),
  ...limb('legL', [-0.15, -0.1, 0], [-0.22, -0.33, -0.03], [-0.27, -0.58, -0.05], 0.17, 'body'),
  ...limb('legR', [0.15, -0.1, 0], [0.24, -0.33, 0.11], [0.31, -0.58, 0.13], 0.17, 'body'),
  ...boots(),
  ...limb('armR', [0.3, 0.11, 0], [0.43, -0.13, 0], [0.29, -0.12, -0.26], 0.15, 'torso'),
  ...limb('armL', [-0.3, 0.11, 0], [-0.29, -0.22, -0.24], [0.23, -0.14, -0.5], 0.15, 'torso'),
  s('weapon', 'secondary', [0, 0.04, -0.14], [0.16, 0.17, 0.33], armour, 'armREnd'),
  q('barrel', 'cylinder', 'dark', [0, 0, -0.3], [0.12, 0.4, 0.12], 'weapon', [Math.PI / 2, 0, 0]),
  q('muzzle', 'cylinder', 'secondary', [0, 0, -0.54], [0.23, 0.19, 0.23], 'weapon', [
    Math.PI / 2,
    0,
    0,
  ]),
  q('nozzle', 'torus', 'accent', [0, 0, -0.642], [0.18, 0.18, 0.16], 'weapon'),
  q(
    'pilot',
    'sphere',
    'energy',
    [0, -0.08, -0.65],
    [0.045, 0.055, 0.045],
    'weapon',
    undefined,
    'glass',
    true,
  ),
  q(
    'hose',
    'torus',
    'dark',
    [0.34, -0.18, 0.14],
    [0.37, 0.53, 0.4],
    'torso',
    [0, Math.PI / 2, 0],
    'cloth',
  ),
];
for (const x of [-0.19, 0.19]) {
  parts.push(
    q(
      `tank${x}`,
      'capsule',
      'accent',
      [x, 0.11, 0.34],
      [0.27, 0.65, 0.27],
      'torso',
      undefined,
      'enamel',
    ),
  );
  for (const y of [-0.08, 0.27])
    parts.push(
      q(
        `strap${x}${y}`,
        'torus',
        'dark',
        [x, y, 0.34],
        [0.22, 0.22, 0.16],
        'torso',
        [Math.PI / 2, 0, 0],
        'cloth',
      ),
    );
  parts.push(
    q(`valve${x}`, 'torus', 'ivory', [x, 0.52, 0.34], [0.1, 0.1, 0.16], 'torso', [
      Math.PI / 2,
      0,
      0,
    ]),
  );
}
export const clips = { attack: recoil(0.025), skill: recoil(0.055) };
