import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'shark',
  signature: 'floating-shark-puppet-sigil',
  palette: c(0x54a8c5, 0x3c5266, 0x80efff),
  parts: [
    p('body', 'sphere', 'primary', [0, 0.7, 0], [0.52, 0.28, 0.78]),
    p('nose', 'cone', 'secondary', [0, 0.7, -0.7], [0.3, 0.5, 0.3], [Math.PI / 2, 0, 0]),
    p('fin', 'cone', 'dark', [0, 1, 0.05], [0.22, 0.35, 0.12]),
    p('sigil', 'torus', 'energy', [0, 0.72, 0.22], [0.4, 0.4, 0.06], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'hover',
    attack: 'bite',
    skill: 'cast',
    tempo: 0.9,
    amplitude: 0.15,
    recoil: 0.42,
  },
  attack: f('melee', 'shards', 'cone', 'none', 0.18, 0, 9, 7),
  skill: f('summon', 'ripple', 'torus', 'rings', 0.55, 0.8, 28, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
