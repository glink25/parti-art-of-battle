import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'zen_panda',
  signature: 'meditating-panda-orbit',
  palette: c(0xe8ddd0, 0x252b31, 0xe1a2ff),
  parts: [
    p('body', 'sphere', 'ivory', [0, 0.55, 0], [0.42, 0.48, 0.38]),
    p('head', 'sphere', 'primary', [0, 0.96, 0], [0.3, 0.28, 0.3]),
    p('ears', 'torus', 'dark', [0, 1.12, 0], [0.42, 0.2, 0.08]),
    p('orb', 'sphere', 'energy', [0, 0.66, -0.42], [0.18, 0.18, 0.12], undefined, true),
  ],
  motion: {
    idle: 'hover',
    attack: 'punch',
    skill: 'cast',
    tempo: 0.8,
    amplitude: 0.12,
    recoil: 0.28,
  },
  attack: f('melee', 'shockwave', 'sphere', 'rings', 0.2, 0, 9, 5),
  skill: f('wave', 'flower', 'torus', 'rings', 0.68, 0.5, 34, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
