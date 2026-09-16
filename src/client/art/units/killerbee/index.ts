import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'killerbee',
  signature: 'needle-abdomen-four-wing',
  palette: c(0x75b34c, 0x3a592d, 0xffd44f),
  parts: [
    p('abdomen', 'cone', 'primary', [0, 0.62, 0.18], [0.25, 0.58, 0.25], [Math.PI / 2, 0, 0]),
    p('thorax', 'sphere', 'dark', [0, 0.66, -0.18], [0.25, 0.25, 0.28]),
    p('wings', 'box', 'ivory', [0, 0.8, 0.06], [0.8, 0.035, 0.3]),
    p('needle', 'cone', 'energy', [0, 0.62, 0.65], [0.08, 0.38, 0.08], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'flutter',
    attack: 'thrust',
    skill: 'recoil',
    tempo: 1.9,
    amplitude: 0.2,
    recoil: 0.18,
  },
  attack: f('bolt', 'shards', 'cone', 'needles', 0.07, 0.05, 9, 15),
  skill: f('rain', 'crystal', 'cone', 'needles', 0.2, 0.4, 26, 18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
