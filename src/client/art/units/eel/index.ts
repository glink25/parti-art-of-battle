import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'eel',
  signature: 'electric-serpent-coil',
  palette: c(0x56a9c9, 0x344e78, 0x67f4ff),
  parts: [
    p('coil', 'torus', 'primary', [0, 0.58, 0], [0.45, 0.65, 0.16], [0, 0, 0.5]),
    p('head', 'cone', 'secondary', [0, 0.82, -0.4], [0.24, 0.42, 0.22], [Math.PI / 2, 0, 0]),
    p('fins', 'box', 'ivory', [0, 0.72, 0.08], [0.68, 0.04, 0.25]),
    p('core', 'octa', 'energy', [0, 0.62, -0.2], [0.15, 0.15, 0.15], undefined, true),
  ],
  motion: {
    idle: 'coil',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.4,
    amplitude: 0.15,
    recoil: 0.25,
  },
  attack: f('bolt', 'lightning', 'octa', 'sparks', 0.1, 0.25, 10, 12),
  skill: f('wave', 'lightning', 'torus', 'sparks', 0.58, 0.5, 32, 16),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
