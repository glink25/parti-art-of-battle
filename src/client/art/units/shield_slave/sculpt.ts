import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { carvedLimb, puppetFace, swing } from '../../core/puppet';
import type { ArtPart } from '../../core/types';

const shieldOutline: [number, number][] = [
  [-0.5, 0.3],
  [-0.3, 0.5],
  [0.3, 0.5],
  [0.5, 0.3],
  [0.45, -0.3],
  [0, -0.55],
  [-0.45, -0.3],
];
export const parts: ArtPart[] = [
  s('body', 'primary', [0, 0.82, 0.04], [0.53, 0.48, 0.32], armour, undefined, undefined, 'wood'),
  q('waist', 'cylinder', 'dark', [0, -0.25, 0], [0.4, 0.16, 0.3], 'body', undefined, 'wood'),
  s(
    'apron',
    'secondary',
    [0, -0.28, -0.19],
    [0.42, 0.26, 0.06],
    chevron,
    'body',
    undefined,
    'cloth',
  ),
  s('gorget', 'accent', [0, 0.18, -0.18], [0.46, 0.13, 0.07], chevron, 'body', undefined, 'brass'),
  q('neck', 'cylinder', 'dark', [0, 0.3, 0], [0.14, 0.15, 0.14], 'body', undefined, 'wood'),
  q('head', 'muscle', 'primary', [0, 0.43, -0.015], [0.31, 0.28, 0.27], 'body', undefined, 'wood'),
  ...puppetFace('head', 0.28, 0.26, -0.13),
  s('helmet', 'secondary', [0, 0.13, 0], [0.38, 0.16, 0.28], armour, 'head'),
  ...carvedLimb(
    'legL',
    [-0.18, -0.22, 0],
    [-0.23, -0.39, -0.02],
    [-0.27, -0.6, -0.04],
    0.15,
    'body',
  ),
  ...carvedLimb('legR', [0.18, -0.22, 0], [0.23, -0.38, 0.06], [0.28, -0.6, 0.05], 0.15, 'body'),
  ...carvedLimb(
    'armL',
    [-0.3, 0.13, 0],
    [-0.38, -0.08, -0.05],
    [-0.34, -0.12, -0.29],
    0.15,
    'body',
  ),
  ...carvedLimb('armR', [0.3, 0.13, 0], [0.4, -0.07, 0], [0.37, -0.18, -0.2], 0.14, 'body'),
  s('bootL', 'dark', [0, -0.005, -0.04], [0.22, 0.1, 0.25], armour, 'legLEnd', undefined, 'wood'),
  s('bootR', 'dark', [0, -0.005, -0.04], [0.22, 0.1, 0.25], armour, 'legREnd', undefined, 'wood'),
  s(
    'gate',
    'accent',
    [-0.04, 0.03, -0.055],
    [0.69, 0.94, 0.11],
    shieldOutline,
    'armLEnd',
    undefined,
    'brass',
  ),
  s(
    'shieldFace',
    'secondary',
    [0, 0, -0.073],
    [0.61, 0.85, 0.025],
    shieldOutline,
    'gate',
    undefined,
    'wood',
  ),
  s(
    'shieldBoss',
    'ivory',
    [0, 0.02, -0.115],
    [0.24, 0.3, 0.075],
    chevron,
    'gate',
    undefined,
    'steel',
  ),
  q(
    'weapon',
    'cylinder',
    'secondary',
    [0, 0.11, 0],
    [0.075, 0.47, 0.075],
    'armREnd',
    undefined,
    'wood',
  ),
  s('hammer', 'accent', [0, 0.26, 0], [0.23, 0.14, 0.16], armour, 'weapon', undefined, 'brass'),
];
for (const side of [-1, 1]) {
  parts.push(
    s(`pauldron${side}`, 'secondary', [side * 0.3, 0.16, 0], [0.25, 0.23, 0.31], armour, 'body'),
  );
  for (const y of [-0.26, 0.25])
    parts.push(
      q(
        `rivet${side}${y}`,
        'sphere',
        'accent',
        [side * 0.22, y, -0.104],
        [0.045, 0.045, 0.03],
        'gate',
        undefined,
        'brass',
      ),
    );
  parts.push(
    q(
      `shieldPlank${side}`,
      'roundedBox',
      'dark',
      [side * 0.16, 0, -0.092],
      [0.012, 0.7, 0.012],
      'gate',
      undefined,
      'wood',
    ),
  );
}
export const clips = {
  attack: swing('armL', [0.2, -0.3, 0.18]),
  skill: {
    tracks: [...swing('armL', [-0.2, 0.25, -0.1]).tracks, ...swing('head', [0.12, 0, 0]).tracks],
  },
};
