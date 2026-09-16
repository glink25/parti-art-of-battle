import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'whale',
  signature: 'floating-whale-wave-fins',
  palette: c(0x54a8c8, 0x315b78, 0x86f6ff),
  parts: [
    p('body', 'sphere', 'primary', [0, 0.74, 0.05], [0.62, 0.3, 0.82]),
    p('tail', 'cone', 'secondary', [0, 0.72, 0.82], [0.45, 0.42, 0.18], [Math.PI / 2, 0, 0]),
    p('finL', 'cone', 'ivory', [-0.48, 0.66, 0.05], [0.34, 0.5, 0.12], [0, 0, 0.8]),
    p('spout', 'torus', 'energy', [0, 1.05, -0.18], [0.2, 0.28, 0.06], [Math.PI / 2, 0, 0], true),
  ],
  motion: {
    idle: 'hover',
    attack: 'slam',
    skill: 'blast',
    tempo: 0.7,
    amplitude: 0.18,
    recoil: 0.3,
  },
  attack: f('wave', 'ripple', 'torus', 'rings', 0.25, 0.2, 12, 5),
  skill: f('wave', 'ripple', 'torus', 'ribbon', 0.72, 0.6, 36, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
