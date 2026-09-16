import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'spider',
  signature: 'eight-leg-web-abdomen',
  palette: c(0x70ae49, 0x3f3654, 0xe882ff),
  parts: [
    p('abdomen', 'sphere', 'primary', [0, 0.48, 0.22], [0.38, 0.28, 0.43]),
    p('head', 'ico', 'secondary', [0, 0.48, -0.25], [0.26, 0.23, 0.28]),
    p('legs', 'torus', 'dark', [0, 0.35, 0], [0.68, 0.46, 0.12], [Math.PI / 2, 0, 0]),
    p('spinner', 'octa', 'energy', [0, 0.5, 0.58], [0.12, 0.12, 0.12], undefined, true),
  ],
  motion: {
    idle: 'stalk',
    attack: 'bite',
    skill: 'cast',
    tempo: 1.55,
    amplitude: 0.08,
    recoil: 0.2,
  },
  attack: f('bolt', 'web', 'octa', 'ribbon', 0.1, 0.3, 10, 8),
  skill: f('wave', 'web', 'torus', 'ribbon', 0.55, 0.4, 28, 10),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
