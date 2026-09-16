import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'nakoruru',
  signature: 'hawk-companion-dagger',
  palette: c(0xde685b, 0x564465, 0xffe77b),
  parts: [
    p('body', 'cylinder', 'primary', [0, 0.58, 0], [0.28, 0.48, 0.25]),
    p('head', 'sphere', 'ivory', [0, 0.98, 0], [0.2, 0.2, 0.2]),
    p('dagger', 'cone', 'secondary', [0.32, 0.65, -0.25], [0.1, 0.48, 0.1], [0.6, 0, 0]),
    p('hawk', 'ico', 'energy', [-0.42, 1.08, 0.05], [0.24, 0.16, 0.34], undefined, true),
  ],
  motion: {
    idle: 'breathe',
    attack: 'slash',
    skill: 'charge',
    tempo: 1.6,
    amplitude: 0.09,
    recoil: 0.5,
  },
  attack: f('melee', 'shards', 'cone', 'needles', 0.16, 0, 10, 12),
  skill: f('dash', 'burst', 'cone', 'ribbon', 0.44, 0.35, 28, 18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
