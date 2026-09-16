import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb, boots } from '../../core/infantry';
import { swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.82, 0], [0.4, 0.2, 0.3], armour),
  s('torso', 'primary', [0, 0.15, 0], [0.52, 0.42, 0.34], armour, 'body'),
  s('chest', 'ivory', [0, 0.02, -0.2], [0.38, 0.24, 0.06], chevron, 'torso'),
  q('head', 'sphere', 'dark', [0, 0.37, 0], [0.31, 0.31, 0.3], 'torso', undefined, 'cloth'),
  s('helmet', 'primary', [0, 0.09, 0], [0.39, 0.22, 0.34], armour, 'head'),
  s('visor', 'energy', [0, 0, -0.2], [0.26, 0.09, 0.025], armour, 'head', undefined, 'glass'),
  q(
    'lamp',
    'sphere',
    'energy',
    [0, 0.14, -0.19],
    [0.055, 0.055, 0.025],
    'head',
    undefined,
    'glass',
    true,
  ),
  ...limb('legL', [-0.14, -0.1, 0], [-0.21, -0.36, 0], [-0.25, -0.6, -0.035], 0.16, 'body'),
  ...limb('legR', [0.14, -0.1, 0], [0.22, -0.35, 0.1], [0.29, -0.6, 0.11], 0.16, 'body'),
  ...boots(),
  ...limb('armL', [-0.3, 0.11, 0], [-0.4, -0.06, -0.08], [-0.36, -0.1, -0.29], 0.15, 'torso'),
  ...limb('armR', [0.3, 0.11, 0], [0.43, -0.06, 0], [0.46, -0.16, -0.15], 0.15, 'torso'),
  s(
    'shield',
    'secondary',
    [0, -0.1, -0.05],
    [0.64, 0.94, 0.12],
    [
      [-0.5, 0.32],
      [-0.3, 0.5],
      [0.3, 0.5],
      [0.5, 0.32],
      [0.5, -0.5],
      [-0.5, -0.5],
    ],
    'armLEnd',
  ),
  s('shieldInsert', 'primary', [0, -0.07, -0.08], [0.53, 0.59, 0.04], armour, 'shield'),
  q(
    'window',
    'roundedBox',
    'dark',
    [0, 0.29, -0.08],
    [0.36, 0.095, 0.025],
    'shield',
    undefined,
    'glass',
  ),
  s('emblem', 'ivory', [0, 0, -0.12], [0.28, 0.2, 0.025], chevron, 'shield'),
  q('baton', 'cylinder', 'dark', [0, 0.16, 0], [0.07, 0.47, 0.07], 'armREnd', [0.15, 0, -0.2]),
  q(
    'batonTip',
    'cylinder',
    'energy',
    [0, 0.21, 0],
    [0.12, 0.18, 0.12],
    'baton',
    undefined,
    'glass',
    true,
  ),
];
for (const k of ['L', 'R'])
  parts.push(s(`knee${k}`, 'ivory', [0, 0, -0.085], [0.18, 0.17, 0.045], armour, `leg${k}Elbow`));
export const clips = {
  attack: swing('armR', [0.65, 0, -0.2]),
  skill: swing('armL', [-0.22, -0.22, 0.12]),
};
