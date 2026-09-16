import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'athena',
  signature: 'crystal-orbit-psychic-fighter',
  palette: c(0xe06b78, 0x68437e, 0xff8de8),
  parts: [
    p('body', 'cylinder', 'primary', [0, 0.58, 0], [0.28, 0.48, 0.25]),
    p('head', 'sphere', 'ivory', [0, 0.98, 0], [0.2, 0.2, 0.2]),
    p('orbL', 'sphere', 'energy', [-0.38, 0.78, 0], [0.14, 0.14, 0.14], undefined, true),
    p('orbR', 'octa', 'secondary', [0.38, 0.78, 0], [0.14, 0.14, 0.14], undefined, true),
  ],
  motion: {
    idle: 'hover',
    attack: 'punch',
    skill: 'cast',
    tempo: 1.25,
    amplitude: 0.13,
    recoil: 0.38,
  },
  attack: f('orb', 'crystal', 'sphere', 'rings', 0.12, 0.35, 11, 9),
  skill: f('wave', 'vortex', 'octa', 'rings', 0.62, 0.55, 36, 14),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
