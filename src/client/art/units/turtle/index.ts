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
  attack: f('玄甲水击', 'thrust', 'water', 'crack', 0.44, 15, 11, 0, 1.22, 1.3),
  skill: f('玄水流纹结界', 'ward', 'water', 'sigil', 0.89, 34, 22, 0, 1.22, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
