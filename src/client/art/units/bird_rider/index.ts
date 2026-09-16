import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'bird_rider',
  signature: 'winged-mount-lancer-rider',
  palette: c(0xc08b55, 0x6c4a68, 0x7ee8ff),
  parts: [
    p('bird', 'ico', 'primary', [0, 0.64, 0.05], [0.35, 0.28, 0.55]),
    p('wingL', 'box', 'secondary', [-0.45, 0.72, 0.1], [0.62, 0.05, 0.28], [0, 0, 0.2]),
    p('wingR', 'box', 'secondary', [0.45, 0.72, 0.1], [0.62, 0.05, 0.28], [0, 0, -0.2]),
    p('rider', 'cylinder', 'ivory', [0, 0.96, 0.05], [0.18, 0.3, 0.18]),
    p('lance', 'cylinder', 'energy', [0.3, 0.82, -0.28], [0.045, 0.7, 0.045], [0.6, 0, 0], true),
  ],
  motion: {
    idle: 'flutter',
    attack: 'thrust',
    skill: 'charge',
    tempo: 1.5,
    amplitude: 0.2,
    recoil: 0.35,
  },
  attack: f('bolt', 'shards', 'cone', 'needles', 0.09, 0.25, 8, 8),
  skill: f('dash', 'burst', 'cone', 'ribbon', 0.25, 0.3, 18, 10),
  portrait: { yaw: 0.42, pitch: 0.12, scale: 0.84 },
});
