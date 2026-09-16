import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'arhat',
  signature: 'prayer-beads-palm-cannon',
  palette: c(0xd5a04d, 0x7a5135, 0xffe391),
  parts: [
    p('robe', 'cone', 'primary', [0, 0.48, 0], [0.38, 0.68, 0.38]),
    p('head', 'sphere', 'ivory', [0, 0.95, 0], [0.22, 0.22, 0.22]),
    p('beads', 'torus', 'secondary', [0, 0.72, -0.2], [0.28, 0.32, 0.08], [Math.PI / 2, 0, 0]),
    p('palm', 'sphere', 'accent', [0.38, 0.66, -0.22], [0.18, 0.12, 0.18]),
    p('focus', 'octa', 'energy', [0.48, 0.67, -0.35], [0.12, 0.12, 0.12], undefined, true),
  ],
  motion: {
    idle: 'breathe',
    attack: 'cast',
    skill: 'punch',
    tempo: 0.85,
    amplitude: 0.09,
    recoil: 0.5,
  },
  attack: f('bolt', 'burst', 'sphere', 'rings', 0.12, 0.15, 9, 8),
  skill: f('beam', 'shockwave', 'octa', 'ribbon', 0.24, 0.1, 22, 5),
  portrait: { yaw: -0.32, pitch: 0.02, scale: 1 },
});
