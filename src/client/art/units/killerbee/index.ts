import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'killerbee',
  signature: 'needle-abdomen-four-wing',
  palette: c(0x75b34c, 0x3a592d, 0xffd44f),
  parts,
  clips,
  anchors: { attack: 'needle', skill: 'needle' },
  motion: {
    idle: 'flutter',
    attack: 'thrust',
    skill: 'recoil',
    tempo: 1.9,
    amplitude: 0.2,
    recoil: 0.18,
  },
  attack: f('蜂针细线', 'shot', 'slash', 'acid', 0.37, 13, 9, 0.25, 0.84, 1.18),
  skill: f('连刺蜂针尾迹', 'salvo', 'slash', 'acid', 0.82, 32, 20, 0, 0.84, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
