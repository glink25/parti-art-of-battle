import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Four-cost puppet summoner: tall crown, broad split robes and suspended marionette.
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.91, 0], [0.38, 0.26, 0.29], armour, undefined, undefined, 'cloth'),
  s('torso', 'primary', [0, 0.23, 0], [0.43, 0.43, 0.3], armour, 'body', undefined, 'cloth'),
  s('collar', 'ivory', [0, 0.2, -0.17], [0.39, 0.22, 0.05], chevron, 'torso', undefined, 'cloth'),
  q('head', 'sphere', 'ivory', [0, 0.4, -0.025], [0.25, 0.29, 0.24], 'torso', undefined, 'fur'),
  s('mask', 'ivory', [0, -0.015, -0.105], [0.23, 0.25, 0.055], armour, 'head', undefined, 'stone'),
  s(
    'crown',
    'secondary',
    [0, 0.24, 0.005],
    [0.38, 0.31, 0.22],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [0.25, 0.18],
      [0, 0.5],
      [-0.25, 0.18],
      [-0.5, 0.5],
    ],
    'head',
  ),
  q(
    'crownGem',
    'octa',
    'energy',
    [0, 0.24, -0.12],
    [0.1, 0.16, 0.04],
    'head',
    undefined,
    'glass',
    true,
  ),
  s('belt', 'accent', [0, -0.02, -0.165], [0.39, 0.09, 0.045], armour, 'body', undefined, 'brass'),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    ...limb(
      'leg' + n,
      [side * 0.11, -0.09, 0],
      [side * 0.14, -0.4, 0.025],
      [side * 0.16, -0.69, 0.015],
      0.12,
      'body',
    ),
    s(
      'foot' + n,
      'dark',
      [0, -0.005, -0.04],
      [0.17, 0.1, 0.24],
      armour,
      'leg' + n + 'End',
      undefined,
      'cloth',
    ),
    s(
      'robe' + n,
      'primary',
      [side * 0.14, -0.33, 0.055],
      [0.37, 0.75, 0.27],
      [
        [-0.3, 0.5],
        [0.3, 0.5],
        [0.5, -0.3],
        [0.3, -0.5],
        [-0.5, -0.5],
      ],
      'body',
      [0, 0, -side * 0.12],
      'cloth',
    ),
    s(
      'panel' + n,
      'ivory',
      [side * 0.12, -0.3, -0.115],
      [0.085, 0.61, 0.035],
      chevron,
      'body',
      [0, 0, -side * 0.12],
      'cloth',
    ),
    ...limb(
      'arm' + n,
      [side * 0.26, 0.16, 0],
      [side * 0.45, 0.02, -0.03],
      [side * 0.49, 0.08, -0.24],
      0.11,
      'torso',
    ),
    s(
      'sleeve' + n,
      'primary',
      [side * 0.04, -0.17, 0.025],
      [0.3, 0.43, 0.26],
      chevron,
      'arm' + n,
      undefined,
      'cloth',
    ),
    s(
      'cuff' + n,
      'ivory',
      [0, 0, 0.02],
      [0.16, 0.12, 0.16],
      armour,
      'arm' + n + 'End',
      undefined,
      'cloth',
    ),
  );
}
parts.push(
  s(
    'controller',
    'accent',
    [0, 0.04, 0],
    [0.39, 0.035, 0.055],
    armour,
    'armREnd',
    undefined,
    'wood',
  ),
  s('crossbar', 'accent', [0, 0, 0], [0.055, 0.035, 0.25], armour, 'controller', undefined, 'wood'),
  s(
    'puppet',
    'secondary',
    [0, -0.46, 0],
    [0.13, 0.18, 0.085],
    armour,
    'controller',
    undefined,
    'wood',
  ),
  q('puppetHead', 'sphere', 'ivory', [0, 0.14, 0], [0.1, 0.12, 0.09], 'puppet', undefined, 'wood'),
  q(
    'focus',
    'octa',
    'energy',
    [0, 0.115, -0.05],
    [0.06, 0.07, 0.025],
    'armLEnd',
    undefined,
    'glass',
    true,
  ),
);
for (const side of [-1, 1]) {
  parts.push(
    v(
      'string' + side,
      'ivory',
      [side * 0.14, 0, 0],
      [
        [0, 0, 0, 0.003],
        [-side * 0.06, -0.39, 0, 0.003],
      ],
      'controller',
    ),
    ...limb(
      'puppetArm' + side,
      [side * 0.08, 0.07, 0],
      [side * 0.12, 0.01, 0],
      [side * 0.1, -0.055, -0.03],
      0.025,
      'puppet',
    ),
    ...limb(
      'puppetLeg' + side,
      [side * 0.04, -0.09, 0],
      [side * 0.065, -0.17, 0],
      [side * 0.065, -0.24, 0],
      0.027,
      'puppet',
    ),
    s(
      'puppetBlade' + side,
      'ivory',
      [0, -0.025, -0.06],
      [0.035, 0.12, 0.014],
      chevron,
      'puppetArm' + side + 'End',
      undefined,
      'steel',
    ),
  );
}
export const clips = {
  attack: action('armL', [-0.3, 0, -0.1]),
  skill: {
    tracks: [
      ...action('armR', [-0.25, 0, 0.12]).tracks,
      ...action('armL', [-0.35, 0, -0.2]).tracks,
    ],
  },
};

for (const side of [-1, 1])
  parts.push(
    q(
      'eye' + side,
      'sphere',
      'dark',
      [side * 0.055, 0.025, -0.14],
      [0.026, 0.023, 0.018],
      'head',
      undefined,
      'fur',
    ),
    s(
      'brow' + side,
      'secondary',
      [side * 0.055, 0.052, -0.14],
      [0.065, 0.018, 0.016],
      armour,
      'head',
      undefined,
      'fur',
    ),
  );
parts.push(
  q('nose', 'sphere', 'ivory', [0, -0.005, -0.158], [0.04, 0.05, 0.045], 'head', undefined, 'fur'),
);
