import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'monk_panda',
  signature: 'panda-iron-fist-stance',
  palette: c(0xe6dbcd, 0x292f34, 0xffd25d),
  parts: [
    p('body', 'sphere', 'ivory', [0, 0.55, 0], [0.42, 0.48, 0.38]),
    p('head', 'sphere', 'primary', [0, 0.96, 0], [0.3, 0.28, 0.3]),
    p('fistL', 'ico', 'dark', [-0.4, 0.6, -0.2], [0.22, 0.25, 0.22]),
    p('fistR', 'ico', 'energy', [0.4, 0.6, -0.2], [0.22, 0.25, 0.22], undefined, true),
  ],
  motion: {
    idle: 'brace',
    attack: 'punch',
    skill: 'brace',
    tempo: 1.15,
    amplitude: 0.07,
    recoil: 0.42,
  },
  attack: f('melee', 'shards', 'ico', 'blocks', 0.2, 0, 9, 6),
  skill: f('wave', 'hex', 'torus', 'rings', 0.48, 0.2, 20, 4),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
