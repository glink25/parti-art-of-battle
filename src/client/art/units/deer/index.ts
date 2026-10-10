import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'deer',
  signature: 'flower-antler-life-deer',
  palette: c(0xd9ad68, 0x5f925c, 0x80ffc0),
  parts,
  clips,
  anchors: { attack: 'nose', skill: 'flower' },
  motion: {
    idle: 'prowl',
    attack: 'thrust',
    skill: 'cast',
    tempo: 0.9,
    amplitude: 0.1,
    recoil: 0.18,
  },
  attack: f('鹿角叶矢', 'shot', 'leaf', 'soul', 0.3, 15, 7, 0.25, 0.84, 1.06),
  skill: f('长生花露', 'bloom', 'leaf', 'water', 0.75, 34, 18, 0, 0.84, 1.06),
  portrait: { yaw: 0.35, pitch: 0.02, scale: 0.92 },
});
