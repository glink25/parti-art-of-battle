import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'buddha',
  signature: 'sun-disc-war-staff',
  palette: c(0xd6a34e, 0x7d3f32, 0xffe66c),
  parts: [
    p('body', 'cylinder', 'primary', [0, 0.62, 0], [0.34, 0.56, 0.3]),
    p('head', 'sphere', 'ivory', [0, 1.08, 0], [0.22, 0.22, 0.22]),
    p('sun', 'torus', 'energy', [0, 1.02, 0.18], [0.45, 0.45, 0.08], [Math.PI / 2, 0, 0], true),
    p('staff', 'cylinder', 'secondary', [0.45, 0.7, -0.05], [0.07, 0.95, 0.07], [0, 0, -0.4]),
  ],
  motion: {
    idle: 'brace',
    attack: 'slash',
    skill: 'slam',
    tempo: 0.9,
    amplitude: 0.09,
    recoil: 0.64,
  },
  attack: f('melee', 'shards', 'cylinder', 'ribbon', 0.24, 0, 12, 8),
  skill: f('wave', 'shockwave', 'torus', 'rings', 0.8, 0.25, 42, 11),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
