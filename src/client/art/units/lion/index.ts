import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'lion',
  signature: 'crystal-mane-roaring-beast',
  palette: c(0xe2a647, 0x913f36, 0xffcf58),
  parts,
  clips,
  anchors: { attack: 'nose', skill: 'jaw' },
  motion: {
    idle: 'prowl',
    attack: 'claw',
    skill: 'bite',
    tempo: 0.9,
    amplitude: 0.11,
    recoil: 0.35,
  },
  attack: f('狮爪三痕', 'cut', 'slash', 'feather', 0.37, 13, 11, 0, 1.03, 0.94),
  skill: f('石化怒吼岩纹', 'quake', 'crack', 'crystal', 0.8, 32, 22, 0, 1.03, 0.94),
  portrait: { yaw: 0.35, pitch: 0, scale: 0.92 },
});
