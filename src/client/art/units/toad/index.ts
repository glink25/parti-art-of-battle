import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'toad',
  signature: 'giant-mouth-balloon-toad',
  palette: c(0xa56b87, 0x65465b, 0xff8ad4),
  parts,
  clips,
  anchors: { attack: 'tongue', skill: 'tongue' },
  motion: {
    idle: 'hover',
    attack: 'bite',
    skill: 'bite',
    tempo: 0.95,
    amplitude: 0.16,
    recoil: 0.5,
  },
  attack: f('长舌黏液', 'thrust', 'acid', 'water', 0.3, 15, 11, 0, 0.65, 1.3),
  skill: f('吞噬旋吸', 'swallow', 'acid', 'soul', 0.75, 34, 22, 0, 0.65, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
