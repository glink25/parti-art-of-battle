import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'bat',
  signature: 'crescent-sonic-wings',
  palette: c(0xa95f82, 0x55344f, 0x82e8ff),
  parts,
  clips,
  anchors: { attack: 'mouth', skill: 'mouth' },
  motion: {
    idle: 'flutter',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.65,
    amplitude: 0.22,
    recoil: 0.28,
  },
  attack: f('翼振声纹', 'wave', 'soul', 'feather', 0.335, 11, 7, 0, 0.65, 1.06),
  skill: f('回声音爆', 'wave', 'soul', 'web', 0.785, 30, 18, 0, 0.65, 1.06),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
