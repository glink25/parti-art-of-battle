import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { carvedLimb, puppetFace, swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';

export const parts: ArtPart[] = [
  s('body', 'primary', [0, 0.7, 0.08], [0.32, 0.36, 0.26], armour, undefined, undefined, 'wood'),
  s(
    'vestL',
    'secondary',
    [-0.12, 0.03, -0.14],
    [0.14, 0.35, 0.04],
    chevron,
    'body',
    [0, 0, -0.14],
    'cloth',
  ),
  s(
    'vestR',
    'secondary',
    [0.12, 0.03, -0.14],
    [0.14, 0.35, 0.04],
    chevron,
    'body',
    [0, 0, 0.14],
    'cloth',
  ),
  q('neck', 'cylinder', 'dark', [0, 0.23, -0.02], [0.1, 0.14, 0.1], 'body', undefined, 'wood'),
  q('head', 'muscle', 'primary', [0, 0.38, -0.04], [0.24, 0.3, 0.22], 'body', undefined, 'wood'),
  ...puppetFace('head', 0.23, 0.3, 0.18),
  s(
    'browBand',
    'secondary',
    [0, 0.11, -0.09],
    [0.3, 0.07, 0.16],
    armour,
    'head',
    undefined,
    'cloth',
  ),
  s(
    'bandTail',
    'secondary',
    [-0.17, 0.08, 0.1],
    [0.12, 0.4, 0.035],
    [
      [0, 0.5],
      [0.5, -0.5],
      [-0.2, -0.35],
      [-0.5, -0.45],
    ],
    'head',
    [0.2, 0, -0.55],
    'cloth',
  ),
  ...carvedLimb(
    'legL',
    [-0.1, -0.15, 0],
    [-0.34, -0.28, -0.08],
    [-0.42, -0.48, -0.06],
    0.125,
    'body',
  ),
  ...carvedLimb('legR', [0.1, -0.15, 0], [0.29, -0.28, 0.1], [0.4, -0.48, 0.1], 0.125, 'body'),
  ...carvedLimb('armL', [-0.2, 0.12, 0], [-0.35, -0.07, -0.14], [-0.27, 0.03, -0.3], 0.105, 'body'),
  ...carvedLimb('armR', [0.2, 0.12, 0], [0.36, 0.08, -0.13], [0.32, 0.2, -0.3], 0.105, 'body'),
  s('bootL', 'dark', [0, 0, -0.05], [0.18, 0.11, 0.23], armour, 'legLEnd', undefined, 'wood'),
  s('bootR', 'dark', [0, 0, -0.05], [0.18, 0.11, 0.23], armour, 'legREnd', undefined, 'wood'),
  q(
    'staff',
    'cylinder',
    'secondary',
    [-0.29, -0.09, 0],
    [0.064, 1.8, 0.064],
    'armREnd',
    [0, 0, -1.3],
    'wood',
  ),
  q('tipL', 'cylinder', 'accent', [0, -0.79, 0], [0.09, 0.23, 0.09], 'staff', undefined, 'brass'),
  q('tipR', 'cylinder', 'accent', [0, 0.79, 0], [0.09, 0.23, 0.09], 'staff', undefined, 'brass'),
  q(
    'belt',
    'roundedBox',
    'accent',
    [0, -0.15, -0.14],
    [0.35, 0.07, 0.04],
    'body',
    undefined,
    'cloth',
  ),
  s(
    'sash',
    'secondary',
    [0.08, -0.3, -0.16],
    [0.15, 0.33, 0.04],
    chevron,
    'body',
    [0, 0, 0.16],
    'cloth',
  ),
];
for (let i = 0; i < 5; i++)
  parts.push(
    q(
      `grip${i}`,
      'torus',
      'ivory',
      [0, (i - 2) * 0.09, 0],
      [0.079, 0.079, 0.1],
      'staff',
      [Math.PI / 2, 0, 0],
      'cloth',
    ),
  );
export const clips = {
  attack: {
    tracks: [
      ...swing('armR', [0.35, -0.25, 0.1]).tracks,
      ...swing('armL', [0, 0.15, -0.35]).tracks,
    ],
  },
  skill: {
    tracks: [
      ...swing('armR', [0.5, 0.35, 0.25], 0.6).tracks,
      ...swing('armL', [0.1, 0.15, -0.45], 0.6).tracks,
    ],
  },
};
