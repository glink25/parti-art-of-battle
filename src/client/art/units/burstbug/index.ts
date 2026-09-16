import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'burstbug',
  signature: 'volatile-glowing-abdomen',
  palette: c(0x74b949, 0x3c642f, 0xff6d42),
  parts: [
    p('abdomen', 'sphere', 'energy', [0, 0.46, 0.28], [0.42, 0.34, 0.5], undefined, true),
    p('thorax', 'ico', 'primary', [0, 0.47, -0.18], [0.3, 0.28, 0.34]),
    p('eye', 'sphere', 'accent', [0, 0.56, -0.47], [0.16, 0.12, 0.14]),
    p('legL', 'box', 'dark', [-0.4, 0.3, 0], [0.45, 0.04, 0.05], [0, 0, 0.25]),
    p('legR', 'box', 'secondary', [0.4, 0.3, 0], [0.45, 0.04, 0.05], [0, 0, -0.25]),
  ],
  motion: {
    idle: 'coil',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.7,
    amplitude: 0.13,
    recoil: 0.2,
  },
  attack: f('melee', 'burst', 'cone', 'none', 0.14, 0, 7, 5),
  skill: f('wave', 'flame', 'ico', 'embers', 0.72, 0.2, 30, 11),
  portrait: { yaw: 0.25, pitch: 0.1, scale: 0.9 },
});
