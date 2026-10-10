import { flesh as v } from '../../core/organic';
import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { limb } from '../../core/infantry';
import { action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
export const parts: ArtPart[] = [
  s('body', 'secondary', [0, 0.51, 0], [0.23, 0.2, 0.2], armour, undefined, undefined, 'cloth'),
  s('tunic', 'primary', [0, 0.14, 0], [0.25, 0.23, 0.22], armour, 'body', undefined, 'cloth'),
  s('bib', 'ivory', [0, 0.04, -0.125], [0.18, 0.19, 0.025], chevron, 'tunic', undefined, 'cloth'),
  q('head', 'sphere', 'ivory', [0, 0.29, -0.025], [0.27, 0.29, 0.25], 'tunic', undefined, 'fur'),
  v(
    'fringe',
    'secondary',
    [0, 0.095, -0.04],
    [
      [-0.1, 0, 0, 0.045],
      [0, 0.035, -0.055, 0.055],
      [0.1, 0, 0, 0.04],
    ],
    'head',
  ),
  s('sash', 'accent', [0, -0.01, -0.12], [0.24, 0.06, 0.025], armour, 'body', undefined, 'cloth'),
];
for (const side of [-1, 1]) {
  const n = side < 0 ? 'L' : 'R';
  parts.push(
    q(
      'bun' + n,
      'sphere',
      'secondary',
      [side * 0.15, 0.08, 0.015],
      [0.12, 0.12, 0.11],
      'head',
      undefined,
      'fur',
    ),
    s(
      'ribbon' + n,
      'primary',
      [side * 0.165, -0.035, 0.025],
      [0.045, 0.17, 0.02],
      chevron,
      'head',
      [0, 0, side * 0.2],
      'cloth',
    ),
    ...limb(
      'leg' + n,
      [side * 0.07, -0.05, 0],
      [side * 0.095, -0.16, 0.015],
      [side * 0.1, -0.29, -0.015],
      0.095,
      'body',
    ),
    s(
      'foot' + n,
      'primary',
      [0, -0.005, -0.025],
      [0.13, 0.1, 0.17],
      armour,
      'leg' + n + 'End',
      undefined,
      'cloth',
    ),
    ...limb(
      'arm' + n,
      [side * 0.15, 0.065, 0],
      [side * 0.23, -0.03, -0.04],
      [side * 0.25, 0.02, -0.13],
      0.075,
      'tunic',
    ),
    q(
      'orb' + n,
      'sphere',
      'energy',
      [0, 0.1, -0.025],
      [0.12, 0.12, 0.12],
      'arm' + n + 'End',
      undefined,
      'glass',
      true,
    ),
    s(
      'cuff' + n,
      'ivory',
      [0, 0, 0.02],
      [0.105, 0.07, 0.11],
      armour,
      'arm' + n + 'End',
      undefined,
      'cloth',
    ),
  );
}
export const clips = {
  attack: action('armR', [-0.3, 0, 0]),
  skill: {
    tracks: [
      ...action('armL', [-0.35, 0, -0.23]).tracks,
      ...action('armR', [-0.35, 0, 0.23]).tracks,
    ],
  },
};

for (const side of [-1, 1])
  parts.push(
    q(
      'eye' + side,
      'sphere',
      'dark',
      [side * 0.055, 0.025, -0.108],
      [0.026, 0.023, 0.018],
      'head',
      undefined,
      'fur',
    ),
    s(
      'brow' + side,
      'secondary',
      [side * 0.055, 0.052, -0.102],
      [0.065, 0.018, 0.016],
      armour,
      'head',
      undefined,
      'fur',
    ),
  );
parts.push(
  q('nose', 'sphere', 'ivory', [0, -0.005, -0.127], [0.04, 0.05, 0.045], 'head', undefined, 'fur'),
);
