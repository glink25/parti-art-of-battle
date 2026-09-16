import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'bat',
  signature: 'crescent-sonic-wings',
  palette: c(0xa95f82, 0x55344f, 0x82e8ff),
  parts: [
    p('body', 'ico', 'primary', [0, 0.65, 0], [0.28, 0.35, 0.35]),
    p('wingL', 'cone', 'secondary', [-0.45, 0.7, 0.08], [0.42, 0.68, 0.12], [0, 0, 0.9]),
    p('wingR', 'cone', 'secondary', [0.45, 0.7, 0.08], [0.42, 0.68, 0.12], [0, 0, -0.9]),
    p('mouth', 'torus', 'energy', [0, 0.62, -0.32], [0.16, 0.16, 0.06], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'flutter',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.65,
    amplitude: 0.22,
    recoil: 0.28,
  },
  attack: f('wave', 'ripple', 'torus', 'rings', 0.24, 0.15, 14, 9),
  skill: f('wave', 'shockwave', 'torus', 'rings', 0.55, 0.35, 28, 12),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
