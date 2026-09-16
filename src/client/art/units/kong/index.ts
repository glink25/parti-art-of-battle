import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'kong',
  signature: 'guardian-gauntlet-halo',
  palette: c(0xd6a54d, 0x70492f, 0xffe27a),
  parts: [
    p('feet', 'cylinder', 'dark', [-0.25, 0.16, 0], [0.18, 0.16, 0.24]),
    p('body', 'dodeca', 'primary', [0, 0.56, 0], [0.42, 0.52, 0.34]),
    p('head', 'sphere', 'ivory', [0, 1.02, -0.06], [0.22, 0.22, 0.22]),
    p('gauntlet', 'ico', 'accent', [-0.42, 0.62, -0.18], [0.28, 0.34, 0.28]),
    p('halo', 'torus', 'energy', [0, 0.94, 0.12], [0.38, 0.38, 0.08], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'brace',
    attack: 'punch',
    skill: 'slam',
    tempo: 1.1,
    amplitude: 0.08,
    recoil: 0.32,
  },
  attack: f('melee', 'shards', 'ico', 'blocks', 0.18, 0, 7, 4),
  skill: f('wave', 'hex', 'torus', 'rings', 0.45, 0.2, 18, 2),
  portrait: { yaw: -0.4, pitch: 0.05, scale: 1.05 },
});
