import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'toad',
  signature: 'giant-mouth-balloon-toad',
  palette: c(0xa56b87, 0x65465b, 0xff8ad4),
  parts: [
    p('body', 'sphere', 'primary', [0, 0.64, 0.08], [0.55, 0.42, 0.5]),
    p('mouth', 'torus', 'dark', [0, 0.58, -0.45], [0.36, 0.24, 0.08], [Math.PI / 2, 0, 0]),
    p('eyes', 'sphere', 'ivory', [0, 0.9, -0.32], [0.38, 0.14, 0.16]),
    p('tongue', 'cone', 'energy', [0, 0.54, -0.72], [0.18, 0.5, 0.12], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'hover',
    attack: 'bite',
    skill: 'bite',
    tempo: 0.95,
    amplitude: 0.16,
    recoil: 0.5,
  },
  attack: f('orb', 'burst', 'sphere', 'ribbon', 0.16, 0.5, 10, 6),
  skill: f('dash', 'vortex', 'torus', 'ribbon', 0.48, 0.8, 30, 10),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
