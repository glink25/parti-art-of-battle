import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb, boots, face } from '../../core/infantry';
import { swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'primary', [0, 0.84, 0], [0.29, 0.2, 0.25], armour, undefined, undefined, 'cloth'),
  s('torso', 'ivory', [0, 0.14, 0], [0.36, 0.4, 0.29], armour, 'body', undefined, 'cloth'),
  s(
    'coatL',
    'ivory',
    [-0.11, -0.22, 0],
    [0.22, 0.37, 0.31],
    chevron,
    'body',
    [0, 0, -0.07],
    'cloth',
  ),
  s('coatR', 'ivory', [0.11, -0.22, 0], [0.22, 0.37, 0.31], chevron, 'body', [0, 0, 0.07], 'cloth'),
  q('head', 'sphere', 'ivory', [0, 0.36, 0], [0.23, 0.25, 0.23], 'torso', undefined, 'cloth'),
  ...face('head'),
  s('cap', 'ivory', [0, 0.12, 0], [0.3, 0.105, 0.25], armour, 'head', undefined, 'cloth'),
  q('headset', 'torus', 'primary', [0, 0.025, 0], [0.3, 0.32, 0.23], 'head', [0, Math.PI / 2, 0]),
  ...limb('legL', [-0.1, -0.12, 0], [-0.12, -0.37, 0], [-0.15, -0.62, -0.025], 0.105, 'body'),
  ...limb('legR', [0.1, -0.12, 0], [0.13, -0.37, 0.06], [0.17, -0.62, 0.07], 0.105, 'body'),
  ...boots(),
  ...limb('armR', [0.22, 0.1, 0], [0.3, -0.11, 0], [0.28, -0.04, -0.24], 0.115, 'torso'),
  ...limb('armL', [-0.22, 0.1, 0], [-0.34, -0.11, 0], [-0.37, -0.31, -0.01], 0.115, 'torso'),
  s('case', 'ivory', [0, -0.11, 0], [0.33, 0.26, 0.13], armour, 'armLEnd'),
  q('handle', 'torus', 'dark', [0, 0.135, 0], [0.16, 0.1, 0.16], 'case'),
  s('pack', 'ivory', [0, 0.015, 0.235], [0.34, 0.4, 0.22], armour, 'torso'),
  q('injector', 'cylinder', 'ivory', [0, 0.045, -0.08], [0.075, 0.25, 0.075], 'armREnd', [
    Math.PI / 2,
    0,
    0,
  ]),
  q(
    'vial',
    'cylinder',
    'energy',
    [0, -0.03, 0],
    [0.057, 0.13, 0.057],
    'injector',
    undefined,
    'glass',
    true,
  ),
  q('tip', 'cylinder', 'accent', [0, -0.16, 0], [0.025, 0.08, 0.025], 'injector'),
];
for (const [parent, z, y, size] of [
  ['case', -0.077, 0, 0.15],
  ['pack', 0.13, 0, 0.21],
  ['cap', -0.14, 0, 0.06],
] as const) {
  parts.push(
    q(
      `${parent}CrossV`,
      'roundedBox',
      'accent',
      [0, y, z],
      [size * 0.3, size, 0.018],
      parent,
      undefined,
      'enamel',
    ),
    q(
      `${parent}CrossH`,
      'roundedBox',
      'accent',
      [0, y, z],
      [size, size * 0.3, 0.018],
      parent,
      undefined,
      'enamel',
    ),
  );
}
export const clips = {
  attack: swing('armR', [0.18, 0, 0]),
  skill: swing('armR', [-0.55, 0, -0.15]),
};
