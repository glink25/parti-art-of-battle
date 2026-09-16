import { arch, archHole, armour, detail as q, plate as s } from '../../core/sculpt';
import type { ArtPart } from '../../core/types';

export const towerParts: ArtPart[] = [
  s(
    'foundation',
    'secondary',
    [0, 0.24, 0],
    [0.94, 0.15, 0.94],
    armour,
    undefined,
    undefined,
    'stone',
  ),
  s('step', 'accent', [0, 0.12, 0], [0.79, 0.08, 0.79], armour, 'foundation', undefined, 'brass'),
  // Upright independent column joint, rather than inheriting the plinth rotation.
  q(
    'column',
    'cylinder',
    'secondary',
    [0, 0.71, 0],
    [0.1, 0.83, 0.1],
    undefined,
    undefined,
    'stone',
  ),
  q(
    'heart',
    'sphere',
    'energy',
    [0, 0.06, 0],
    [0.3, 0.48, 0.3],
    'column',
    undefined,
    'glass',
    true,
  ),
  q('capital', 'cylinder', 'accent', [0, 0.47, 0], [0.61, 0.1, 0.61], 'column', undefined, 'brass'),
  q(
    'crown',
    'cylinder',
    'secondary',
    [0, 0.6, 0],
    [0.55, 0.18, 0.55],
    'column',
    undefined,
    'stone',
  ),
  q(
    'rail',
    'torus',
    'accent',
    [0, 0.1, 0],
    [0.69, 0.69, 0.31],
    'crown',
    [Math.PI / 2, 0, 0],
    'brass',
  ),
  q('sealOuter', 'torus', 'accent', [0, 0.33, 0], [0.62, 0.62, 0.24], 'crown', undefined, 'brass'),
  q(
    'sealInner',
    'torus',
    'ivory',
    [0, 0.33, 0],
    [0.43, 0.43, 0.2],
    'crown',
    [0, Math.PI / 2, 0],
    'brass',
  ),
  q('eye', 'sphere', 'energy', [0, 0.33, 0], [0.19, 0.24, 0.19], 'crown', undefined, 'glass', true),
  q('spireTop', 'octa', 'accent', [0, 0.85, 0], [0.27, 0.4, 0.27], 'crown', undefined, 'brass'),
  q('focus', 'octa', 'energy', [0, 1.1, 0], [0.12, 0.19, 0.12], 'crown', undefined, 'glass', true),
];

// Four carved openwork elevations, not solid boxes painted to suggest windows.
for (let i = 0; i < 4; i++) {
  const a = (i * Math.PI) / 2;
  const x = Math.sin(a),
    z = Math.cos(a);
  const cornerX = Math.sin(a + Math.PI / 4) * 0.39;
  const cornerZ = Math.cos(a + Math.PI / 4) * 0.39;
  const wall = `arcade${i}`;
  towerParts.push(
    s(
      wall,
      'ivory',
      [x * 0.245, 0.06, z * 0.245],
      [0.43, 0.7, 0.065],
      arch,
      'column',
      [0, a, 0],
      'stone',
      [archHole.map(([u, v]) => [u, v + 0.07])],
    ),
    s(
      `archGilding${i}`,
      'accent',
      [0, 0.02, 0.047],
      [0.35, 0.59, 0.016],
      arch,
      wall,
      undefined,
      'brass',
      [archHole.map(([u, v]) => [u * 1.22, v + 0.05])],
    ),
    s(
      `buttress${i}`,
      'secondary',
      [cornerX, -0.12, cornerZ],
      [0.13, 0.74, 0.14],
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.4, 0.35],
        [0, 0.6],
        [-0.4, 0.35],
      ],
      'column',
      [0, a + Math.PI / 4, 0],
      'stone',
    ),
    s(
      `finial${i}`,
      'ivory',
      [cornerX, 0.37, cornerZ],
      [0.15, 0.38, 0.15],
      [
        [0, 0.7],
        [0.5, -0.15],
        [0.3, -0.5],
        [-0.3, -0.5],
        [-0.5, -0.15],
      ],
      'column',
      [0, a + Math.PI / 4, 0],
      'stone',
    ),
    s(
      `crownPetal${i}`,
      'primary',
      [x * 0.24, 0.37, z * 0.24],
      [0.18, 0.68, 0.075],
      [
        [0, 0.6],
        [0.5, 0.15],
        [0.25, -0.45],
        [0, -0.5],
        [-0.25, -0.45],
        [-0.5, 0.15],
      ],
      'crown',
      [0, a, 0],
      'enamel',
    ),
    s(
      `petalInlay${i}`,
      'accent',
      [x * 0.287, 0.4, z * 0.287],
      [0.045, 0.4, 0.016],
      [
        [0, 0.6],
        [0.5, 0],
        [0, -0.5],
        [-0.5, 0],
      ],
      'crown',
      [0, a, 0],
      'brass',
    ),
  );
  for (const offset of [-0.034, 0.034])
    towerParts.push(
      q(
        `pilasterFlute${i}${offset}`,
        'cylinder',
        'accent',
        [offset, -0.035, 0.077],
        [0.016, 0.5, 0.016],
        `buttress${i}`,
        undefined,
        'brass',
      ),
    );
  for (let j = 0; j < 3; j++)
    towerParts.push(
      q(
        `baseMoulding${i}${j}`,
        'roundedBox',
        j === 1 ? 'accent' : 'primary',
        [x * (0.34 - j * 0.035), -0.37 + j * 0.05, z * (0.34 - j * 0.035)],
        [0.48 - j * 0.04, 0.036, 0.05],
        'column',
        [0, a, 0],
        j === 1 ? 'brass' : 'stone',
      ),
    );
}
for (let i = 0; i < 12; i++) {
  const a = (i * Math.PI) / 6;
  towerParts.push(
    s(
      `sealGlyph${i}`,
      'accent',
      [Math.sin(a) * 0.35, 0.33 + Math.cos(a) * 0.35, 0],
      [0.045, 0.075, 0.03],
      [
        [0, 0.5],
        [0.5, 0],
        [0, -0.5],
        [-0.5, 0],
      ],
      'crown',
      [0, 0, -a],
      'brass',
    ),
  );
}
