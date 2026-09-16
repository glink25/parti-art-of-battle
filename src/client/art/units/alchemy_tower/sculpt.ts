import { armour, chevron, detail as q, plate as s } from '../../core/sculpt';
import { linkage, barrel, action } from '../../core/mechanical';
import type { ArtPart } from '../../core/types';
// Open distillation apparatus: boiler, visible elixir, copper column and condenser.
export const parts: ArtPart[] = [
  s('base', 'secondary', [0, 0.235, 0], [0.71, 0.13, 0.62], armour),
  s('furnace', 'primary', [-0.13, 0.22, 0], [0.37, 0.33, 0.35], armour, 'base'),
  s(
    'firebox',
    'dark',
    [0, -0.04, -0.19],
    [0.25, 0.18, 0.035],
    [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.2],
      [0, 0.5],
      [-0.5, 0.2],
    ],
    'furnace',
  ),
  q(
    'fire',
    'sphere',
    'energy',
    [0, -0.04, -0.216],
    [0.13, 0.1, 0.025],
    'furnace',
    undefined,
    'glass',
    true,
  ),
  q('boiler', 'sphere', 'accent', [-0.13, 0.52, 0], [0.43, 0.43, 0.4], 'base', undefined, 'brass'),
  q('rim', 'torus', 'ivory', [-0.13, 0.7, 0], [0.34, 0.34, 0.075], 'base', [Math.PI / 2, 0, 0]),
  q(
    'elixir',
    'sphere',
    'energy',
    [-0.13, 0.72, 0],
    [0.26, 0.1, 0.26],
    'base',
    undefined,
    'glass',
    true,
  ),
  q(
    'column',
    'cylinder',
    'accent',
    [-0.13, 1.01, 0.07],
    [0.13, 0.5, 0.13],
    'base',
    undefined,
    'brass',
  ),
  q('dome', 'sphere', 'primary', [-0.13, 1.27, 0.07], [0.23, 0.12, 0.23], 'base'),
  q(
    'pipeTop',
    'cylinder',
    'accent',
    [0.1, 1.26, 0.07],
    [0.05, 0.46, 0.05],
    'base',
    [0, 0, Math.PI / 2],
    'brass',
  ),
  q('condenser', 'cylinder', 'secondary', [0.32, 0.85, 0.07], [0.12, 0.82, 0.12], 'base'),
  q(
    'vial',
    'capsule',
    'energy',
    [0.32, 0.29, 0.07],
    [0.18, 0.24, 0.18],
    'base',
    undefined,
    'glass',
    true,
  ),
  q(
    'vialCollar',
    'torus',
    'accent',
    [0.32, 0.42, 0.07],
    [0.15, 0.15, 0.06],
    'base',
    [Math.PI / 2, 0, 0],
    'brass',
  ),
  q(
    'gauge',
    'cylinder',
    'accent',
    [-0.13, 0.57, -0.21],
    [0.15, 0.06, 0.15],
    'base',
    [Math.PI / 2, 0, 0],
    'brass',
  ),
  q('dial', 'cylinder', 'ivory', [0, 0.038, 0], [0.12, 0.018, 0.12], 'gauge'),
  s('needle', 'dark', [0.018, 0.053, 0], [0.055, 0.015, 0.013], armour, 'gauge', [0, 0.6, 0]),
  q(
    'valve',
    'torus',
    'accent',
    [-0.37, 0.57, 0],
    [0.16, 0.16, 0.06],
    'base',
    [0, Math.PI / 2, 0],
    'brass',
  ),
  q('valveAxle', 'cylinder', 'secondary', [-0.3, 0.57, 0], [0.035, 0.17, 0.035], 'base', [
    0,
    0,
    Math.PI / 2,
  ]),
];
for (let i = 0; i < 6; i++)
  parts.push(
    q(
      'coil' + i,
      'torus',
      'accent',
      [0.32, 0.63 + i * 0.1, 0.07],
      [0.19, 0.19, 0.07],
      'base',
      [Math.PI / 2, 0, 0],
      'brass',
    ),
  );
for (const side of [-1, 1])
  parts.push(
    q(
      'guard' + side,
      'cylinder',
      'secondary',
      [-0.13 + side * 0.17, 0.87, 0.07],
      [0.035, 0.35, 0.035],
      'base',
    ),
    s('foot' + side, 'dark', [side * 0.23, 0.025, 0.04], [0.18, 0.06, 0.4], armour, 'base'),
  );
for (let i = 0; i < 3; i++)
  parts.push(
    q(
      'bubble' + i,
      'sphere',
      'energy',
      [-0.19 + i * 0.06, 0.81 + i * 0.085, -0.04],
      [0.035, 0.035, 0.035],
      'base',
      undefined,
      'glass',
      true,
    ),
  );
export const clips = {
  attack: action('elixir', [0, 0, 0], [0, 0.09, 0]),
  skill: {
    tracks: [
      ...action('elixir', [0, 0, 0], [0, 0.13, 0]).tracks,
      ...action('valve', [0, 0, 1.2]).tracks,
      ...action('bubble2', [0, 0, 0], [0, 0.16, 0]).tracks,
    ],
  },
};
