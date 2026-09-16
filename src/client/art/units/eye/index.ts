import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'eye',
  signature: 'tripod-iris-gazer',
  palette: c(0x78b84c, 0x364d2c, 0xff6fcf),
  parts: [
    p('body', 'sphere', 'primary', [0, 0.68, 0], [0.38, 0.42, 0.3]),
    p('iris', 'torus', 'secondary', [0, 0.7, -0.3], [0.25, 0.25, 0.08], [Math.PI / 2, 0, 0]),
    p('pupil', 'sphere', 'energy', [0, 0.7, -0.4], [0.1, 0.14, 0.05], undefined, true),
    p('legs', 'cone', 'dark', [0, 0.3, 0.05], [0.48, 0.52, 0.42]),
  ],
  motion: {
    idle: 'stalk',
    attack: 'cast',
    skill: 'cast',
    tempo: 1.05,
    amplitude: 0.09,
    recoil: 0.18,
  },
  attack: f('beam', 'crystal', 'sphere', 'rings', 0.09, 0.05, 9, 7),
  skill: f('beam', 'hex', 'sphere', 'ribbon', 0.25, 0.05, 20, 10),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
