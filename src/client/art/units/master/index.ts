import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'master',
  signature: 'puppet-master-string-crown',
  palette: c(0x9777cc, 0x554172, 0xd59aff),
  parts: [
    p('robe', 'cone', 'primary', [0, 0.48, 0], [0.4, 0.72, 0.4]),
    p('mask', 'sphere', 'ivory', [0, 0.98, -0.06], [0.2, 0.22, 0.2]),
    p('crown', 'torus', 'secondary', [0, 1.22, 0], [0.32, 0.2, 0.08]),
    p(
      'strings',
      'cylinder',
      'energy',
      [0.38, 0.78, -0.05],
      [0.025, 0.8, 0.025],
      [0, 0, -0.4],
      true,
    ),
  ],
  motion: {
    idle: 'hover',
    attack: 'cast',
    skill: 'cast',
    tempo: 0.72,
    amplitude: 0.13,
    recoil: 0.2,
  },
  attack: f('orb', 'hex', 'octa', 'rings', 0.12, 0.4, 10, 7),
  skill: f('summon', 'vortex', 'octa', 'ribbon', 0.52, 0.8, 30, 11),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
