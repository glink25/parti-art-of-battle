import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'tree',
  signature: 'ancient-root-crown-tree',
  palette: c(0x65766d, 0x4f743e, 0x8dff73),
  parts: [
    p('roots', 'torus', 'dark', [0, 0.22, 0], [0.6, 0.42, 0.14], [Math.PI / 2, 0, 0]),
    p('trunk', 'cylinder', 'primary', [0, 0.68, 0], [0.32, 0.85, 0.32]),
    p('crown', 'dodeca', 'secondary', [0, 1.22, 0], [0.62, 0.42, 0.55]),
    p('heart', 'sphere', 'energy', [0, 0.82, -0.32], [0.16, 0.2, 0.12], undefined, true),
  ],
  motion: {
    idle: 'tower',
    attack: 'slam',
    skill: 'cast',
    tempo: 0.55,
    amplitude: 0.06,
    recoil: 0.54,
  },
  attack: f('melee', 'shards', 'box', 'blocks', 0.2, 0, 10, 3),
  skill: f('wave', 'flower', 'torus', 'ribbon', 0.72, 0.3, 38, 7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
