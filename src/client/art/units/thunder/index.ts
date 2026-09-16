import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'thunder',
  signature: 'thunder-wings-double-drum',
  palette: c(0x8c70cc, 0x4b3f79, 0x64efff),
  parts: [
    p('body', 'cylinder', 'primary', [0, 0.62, 0], [0.28, 0.48, 0.26]),
    p('head', 'sphere', 'ivory', [0, 1.02, 0], [0.2, 0.2, 0.2]),
    p('wingL', 'cone', 'secondary', [-0.35, 0.82, 0.12], [0.24, 0.55, 0.16], [0, 0, 0.7]),
    p('wingR', 'cone', 'secondary', [0.35, 0.82, 0.12], [0.24, 0.55, 0.16], [0, 0, -0.7]),
    p('drum', 'torus', 'energy', [0, 0.72, -0.3], [0.27, 0.27, 0.1], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'flutter',
    attack: 'cast',
    skill: 'blast',
    tempo: 1.25,
    amplitude: 0.17,
    recoil: 0.3,
  },
  attack: f('bolt', 'lightning', 'octa', 'sparks', 0.1, 0.2, 10, 12),
  skill: f('arc', 'lightning', 'octa', 'rings', 0.36, 0.65, 28, 14),
  portrait: { yaw: -0.35, pitch: 0.08, scale: 0.96 },
});
