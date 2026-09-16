import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'turtle',
  signature: 'shell-fortress-water-ring',
  palette: c(0x8d75c7, 0x355d6c, 0x75eaff),
  parts,
  clips,
  anchors: { attack: 'beak', skill: 'ward' },
  motion: {
    idle: 'brace',
    attack: 'bite',
    skill: 'brace',
    tempo: 0.62,
    amplitude: 0.05,
    recoil: 0.3,
  },
  attack: f('melee', 'ripple', 'sphere', 'none', 0.18, 0, 8, 3),
  skill: f('wave', 'ripple', 'torus', 'rings', 0.72, 0.3, 34, 7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
