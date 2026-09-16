import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'sage',
  signature: 'thunder-hat-floating-talisman',
  palette: c(0x916fd0, 0x423a79, 0x81e8ff),
  parts: [
    p('robe', 'cone', 'primary', [0, 0.46, 0], [0.42, 0.68, 0.4]),
    p('face', 'sphere', 'ivory', [0, 0.92, -0.05], [0.18, 0.19, 0.18]),
    p('hat', 'cone', 'secondary', [0, 1.16, 0], [0.42, 0.32, 0.42]),
    p('staff', 'cylinder', 'dark', [0.4, 0.67, 0], [0.04, 0.72, 0.04]),
    p('thunder', 'octa', 'energy', [0.4, 1.1, 0], [0.2, 0.25, 0.2], undefined, true),
  ],
  motion: {
    idle: 'hover',
    attack: 'cast',
    skill: 'cast',
    tempo: 0.75,
    amplitude: 0.14,
    recoil: 0.18,
  },
  attack: f('bolt', 'lightning', 'octa', 'sparks', 0.11, 0.25, 9, 8),
  skill: f('rain', 'lightning', 'octa', 'sparks', 0.35, 0.8, 26, 12),
  portrait: { yaw: -0.45, pitch: 0.08, scale: 1 },
});
