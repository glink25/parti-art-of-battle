import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'osprey',
  signature: 'razor-osprey-talons',
  palette: c(0x55a9c6, 0x4a5268, 0x79eeff),
  parts: [
    p('body', 'ico', 'primary', [0, 0.7, 0], [0.3, 0.3, 0.48]),
    p('wings', 'box', 'secondary', [0, 0.76, 0.08], [0.92, 0.045, 0.32]),
    p('beak', 'cone', 'accent', [0, 0.72, -0.5], [0.12, 0.32, 0.12], [Math.PI / 2, 0, 0]),
    p('talons', 'cone', 'energy', [0, 0.48, -0.18], [0.3, 0.32, 0.16], undefined, true),
  ],
  motion: {
    idle: 'flutter',
    attack: 'claw',
    skill: 'charge',
    tempo: 1.7,
    amplitude: 0.2,
    recoil: 0.48,
  },
  attack: f('melee', 'shards', 'cone', 'needles', 0.16, 0, 10, 9),
  skill: f('dash', 'burst', 'cone', 'ribbon', 0.34, 0.5, 24, 14),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
