import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'eye',
  signature: 'tripod-iris-gazer',
  palette: c(0x78b84c, 0x364d2c, 0xff6fcf),
  parts,
  clips,
  anchors: { attack: 'pupil', skill: 'pupil' },
  motion: {
    idle: 'stalk',
    attack: 'cast',
    skill: 'cast',
    tempo: 1.05,
    amplitude: 0.09,
    recoil: 0.18,
  },
  attack: f('瞳光细束', 'shot', 'soul', 'sigil', 0.44, 11, 11, 0.25, 0.84, 1.3),
  skill: f('凝视锁魂', 'seal', 'sigil', 'web', 0.89, 30, 22, 0, 0.84, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
