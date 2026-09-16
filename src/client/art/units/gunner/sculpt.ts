import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb, boots, face, rifle, recoil } from '../../core/infantry';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'dark', [0, 0.85, 0], [0.3, 0.15, 0.24], armour, undefined, undefined, 'cloth'),
  s('torso', 'primary', [0, 0.14, 0], [0.35, 0.4, 0.27], armour, 'body', undefined, 'cloth'),
  s('vest', 'secondary', [0, 0.015, -0.16], [0.3, 0.28, 0.05], armour, 'torso'),
  q('head', 'sphere', 'ivory', [0, 0.36, -0.015], [0.22, 0.25, 0.22], 'torso', undefined, 'cloth'),
  ...face('head'),
  s('cap', 'primary', [0, 0.11, 0], [0.29, 0.12, 0.25], armour, 'head', undefined, 'cloth'),
  s('peak', 'secondary', [0, 0.075, -0.15], [0.32, 0.035, 0.2], armour, 'head'),
  q(
    'scarf',
    'torus',
    'accent',
    [0, 0.21, 0],
    [0.32, 0.28, 0.3],
    'torso',
    [Math.PI / 2, 0, 0],
    'cloth',
  ),
  s(
    'scarfTail',
    'accent',
    [-0.2, 0.07, 0.18],
    [0.14, 0.4, 0.035],
    chevron,
    'torso',
    [0.2, 0, -0.25],
    'cloth',
  ),
  ...limb('legL', [-0.1, -0.1, 0], [-0.13, -0.36, -0.04], [-0.16, -0.63, -0.06], 0.12, 'body'),
  ...limb('legR', [0.1, -0.1, 0], [0.17, -0.35, 0.12], [0.26, -0.63, 0.16], 0.12, 'body'),
  ...boots(),
  ...limb('armR', [0.21, 0.12, 0], [0.34, -0.07, 0], [0.22, -0.01, -0.23], 0.115, 'torso'),
  ...limb('armL', [-0.21, 0.12, 0], [-0.25, -0.14, -0.25], [0.19, -0.04, -0.51], 0.115, 'torso'),
  ...rifle('armREnd'),
  s('pack', 'secondary', [0, 0, 0.19], [0.24, 0.25, 0.14], armour, 'torso', undefined, 'cloth'),
];
for (const x of [-0.11, 0.02])
  parts.push(
    s(
      `pouch${x}`,
      'primary',
      [x, -0.11, -0.2],
      [0.09, 0.15, 0.07],
      armour,
      'torso',
      undefined,
      'cloth',
    ),
  );
export const clips = { attack: recoil(0.045), skill: recoil(0.065) };
