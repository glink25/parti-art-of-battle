import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'child',
  signature: 'small-orbiting-spirit-orbs',
  palette: c(0x9a7bd0, 0x56418a, 0x76f4ff),
  parts: [
    p('robe', 'cone', 'primary', [0, 0.45, 0], [0.34, 0.62, 0.34]),
    p('head', 'sphere', 'ivory', [0, 0.9, -0.02], [0.21, 0.21, 0.21]),
    p('cap', 'sphere', 'secondary', [0, 1.08, 0.02], [0.25, 0.13, 0.25]),
    p('orbL', 'sphere', 'energy', [-0.4, 0.72, 0], [0.12, 0.12, 0.12], undefined, true),
    p('orbR', 'octa', 'accent', [0.4, 0.72, 0], [0.13, 0.13, 0.13], undefined, true),
  ],
  motion: {
    idle: 'hover',
    attack: 'cast',
    skill: 'cast',
    tempo: 1.4,
    amplitude: 0.16,
    recoil: 0.12,
  },
  attack: f('orb', 'ripple', 'sphere', 'rings', 0.12, 0.45, 9, 8),
  skill: f('wave', 'flower', 'octa', 'rings', 0.58, 0.4, 24, 5),
  portrait: { yaw: -0.25, pitch: 0.06, scale: 1.08 },
});
