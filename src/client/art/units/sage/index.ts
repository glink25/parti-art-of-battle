import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'sage',
  signature: 'thunder-hat-floating-talisman',
  palette: c(0x916fd0, 0x423a79, 0x81e8ff),
  parts,
  clips,
  anchors: { attack: 'thunder', skill: 'thunder' },
  motion: {
    idle: 'hover',
    attack: 'cast',
    skill: 'cast',
    tempo: 0.75,
    amplitude: 0.14,
    recoil: 0.18,
  },
  attack: f('飞符灵矢', 'shot', 'sigil', 'soul', 0.3, 11, 11, 0.25, 1.6, 1.3),
  skill: f('天师雷暴', 'lightning', 'lightning', 'sigil', 0.78, 30, 22, 0, 1.6, 1.3),
  portrait: { yaw: -0.45, pitch: 0.08, scale: 1 },
});
