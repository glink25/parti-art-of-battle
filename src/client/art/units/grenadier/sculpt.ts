import { armour, detail as q, plate as s } from '../../core/sculpt';
import { limb, boots, face, recoil } from '../../core/infantry';
import { swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'dark', [0, 0.8, 0], [0.38, 0.18, 0.28], armour, undefined, undefined, 'cloth'),
  s('torso', 'primary', [0, 0.13, 0], [0.46, 0.42, 0.31], armour, 'body', undefined, 'cloth'),
  q('head', 'sphere', 'ivory', [0, 0.36, 0], [0.24, 0.26, 0.23], 'torso', undefined, 'cloth'),
  ...face('head'),
  q(
    'helmet',
    'sphere',
    'secondary',
    [0, 0.11, 0.015],
    [0.36, 0.25, 0.33],
    'head',
    undefined,
    'enamel',
  ),
  s(
    'bandolier',
    'dark',
    [0, 0, -0.185],
    [0.105, 0.43, 0.04],
    armour,
    'torso',
    [0, 0, -0.52],
    'cloth',
  ),
  ...limb('legL', [-0.13, -0.1, 0], [-0.2, -0.32, -0.03], [-0.27, -0.58, -0.03], 0.14, 'body'),
  ...limb('legR', [0.13, -0.1, 0], [0.2, -0.34, 0.1], [0.27, -0.58, 0.14], 0.14, 'body'),
  ...boots(),
  ...limb('armR', [0.27, 0.12, 0], [0.39, -0.08, -0.04], [0.34, -0.18, -0.23], 0.13, 'torso'),
  ...limb('armL', [-0.27, 0.12, 0], [-0.41, 0.22, 0], [-0.42, 0.43, -0.06], 0.13, 'torso'),
  q('launcher', 'cylinder', 'secondary', [0, 0.06, -0.18], [0.15, 0.49, 0.15], 'armREnd', [
    Math.PI / 2,
    0,
    0,
  ]),
  q('muzzle', 'torus', 'ivory', [0, -0.25, 0], [0.15, 0.15, 0.12], 'launcher', [Math.PI / 2, 0, 0]),
  q('drum', 'cylinder', 'dark', [0, -0.01, 0.09], [0.24, 0.17, 0.24], 'launcher', [
    0,
    0,
    Math.PI / 2,
  ]),
  q(
    'grenade',
    'muscle',
    'energy',
    [0, 0.08, 0],
    [0.15, 0.19, 0.15],
    'armLEnd',
    undefined,
    'enamel',
    true,
  ),
  q('grenadeCap', 'cylinder', 'dark', [0, 0.11, 0], [0.06, 0.05, 0.06], 'grenade'),
  q('pin', 'torus', 'ivory', [0.045, 0.1, 0], [0.045, 0.045, 0.1], 'grenade'),
  s(
    'satchel',
    'secondary',
    [0.23, -0.12, 0.11],
    [0.2, 0.26, 0.19],
    armour,
    'body',
    undefined,
    'cloth',
  ),
];
for (let i = 0; i < 3; i++)
  parts.push(
    q(
      `ammo${i}`,
      'capsule',
      'accent',
      [(i - 1) * 0.1, (i - 1) * 0.12, -0.22],
      [0.08, 0.13, 0.07],
      'torso',
      undefined,
      'brass',
    ),
  );
export const clips = { attack: recoil(0.04), skill: swing('armL', [-1.2, -0.12, 0.25], 0.62) };
