import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'blood_eagle',
  signature: 'transforming-blood-eagle-wings',
  palette: c(0xc1626f, 0x5a3145, 0xff5268),
  parts,
  clips,
  anchors: { attack: 'talonR1', skill: 'heart' },
  motion: {
    idle: 'flutter',
    attack: 'claw',
    skill: 'charge',
    tempo: 1.55,
    amplitude: 0.2,
    recoil: 0.5,
  },
  attack: f('血羽爪痕', 'cut', 'feather', 'slash', 0.335, 15, 7, 0, 1.03, 1.06),
  skill: f('血鹰展翼蜕变', 'ascend', 'feather', 'fire', 0.785, 34, 18, 0, 1.03, 1.06),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
