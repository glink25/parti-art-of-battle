import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'spider',
  signature: 'eight-leg-web-abdomen',
  palette: c(0x70ae49, 0x3f3654, 0xe882ff),
  parts,
  clips,
  anchors: { attack: 'fangL', skill: 'spinner' },
  motion: {
    idle: 'stalk',
    attack: 'bite',
    skill: 'cast',
    tempo: 1.55,
    amplitude: 0.08,
    recoil: 0.2,
  },
  attack: f('蛛丝毒滴', 'shot', 'web', 'acid', 0.3, 13, 7, 0.25, 1.03, 0.7),
  skill: f('魅惑织网', 'web', 'web', 'soul', 0.75, 32, 18, 0, 1.03, 0.7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
