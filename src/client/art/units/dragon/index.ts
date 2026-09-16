import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'dragon',
  signature: 'serpentine-horned-dragon',
  palette: c(0xd5a04f, 0x72452e, 0x77ecff),
  parts: [
    p('body', 'torus', 'primary', [0, 0.62, 0.08], [0.45, 0.62, 0.2], [0, 0, 0.6]),
    p('head', 'dodeca', 'secondary', [0, 0.84, -0.4], [0.28, 0.25, 0.3]),
    p('horns', 'cone', 'ivory', [0, 1.12, -0.35], [0.2, 0.34, 0.2]),
    p('pearl', 'sphere', 'energy', [0.34, 0.86, -0.3], [0.14, 0.14, 0.14], undefined, true),
  ],
  motion: { idle: 'coil', attack: 'claw', skill: 'slam', tempo: 1.1, amplitude: 0.14, recoil: 0.4 },
  attack: f('orb', 'burst', 'sphere', 'rings', 0.12, 0.4, 9, 8),
  skill: f('wave', 'lightning', 'torus', 'sparks', 0.52, 0.7, 27, 11),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
