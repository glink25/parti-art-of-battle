import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'vine',
  signature: 'twisted-vine-humanoid',
  palette: c(0x697b78, 0x49723e, 0x83ff82),
  parts: [
    p('roots', 'torus', 'dark', [0, 0.22, 0], [0.45, 0.32, 0.12], [Math.PI / 2, 0, 0]),
    p('trunk', 'cylinder', 'primary', [0, 0.62, 0], [0.25, 0.65, 0.25]),
    p('crown', 'dodeca', 'secondary', [0, 1.05, 0], [0.42, 0.34, 0.36]),
    p('bud', 'sphere', 'energy', [0.25, 1.13, -0.18], [0.13, 0.13, 0.13], undefined, true),
  ],
  motion: {
    idle: 'coil',
    attack: 'claw',
    skill: 'cast',
    tempo: 0.72,
    amplitude: 0.1,
    recoil: 0.28,
  },
  attack: f('melee', 'shards', 'cone', 'none', 0.15, 0, 8, 3),
  skill: f('wave', 'flower', 'torus', 'ribbon', 0.62, 0.3, 30, 6),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
