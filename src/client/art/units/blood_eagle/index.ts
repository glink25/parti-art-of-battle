import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'blood_eagle',
  signature: 'transforming-blood-eagle-wings',
  palette: c(0xc1626f, 0x5a3145, 0xff5268),
  parts: [
    p('body', 'ico', 'primary', [0, 0.68, 0], [0.3, 0.34, 0.46]),
    p('wingL', 'cone', 'secondary', [-0.45, 0.72, 0.08], [0.4, 0.72, 0.12], [0, 0, 0.8]),
    p('wingR', 'cone', 'secondary', [0.45, 0.72, 0.08], [0.4, 0.72, 0.12], [0, 0, -0.8]),
    p('heart', 'octa', 'energy', [0, 0.68, -0.32], [0.14, 0.16, 0.12], undefined, true),
  ],
  motion: {
    idle: 'flutter',
    attack: 'claw',
    skill: 'charge',
    tempo: 1.55,
    amplitude: 0.2,
    recoil: 0.5,
  },
  attack: f('melee', 'shards', 'cone', 'needles', 0.16, 0, 10, 11),
  skill: f('dash', 'vortex', 'octa', 'ribbon', 0.45, 0.45, 28, 17),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
