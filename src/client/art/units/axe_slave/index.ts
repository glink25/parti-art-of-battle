import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'axe_slave',
  signature: 'dual-axe-puppet',
  palette: c(0xa9855e, 0x523f45, 0xff7858),
  parts,
  clips,
  anchors: { attack: 'axeHeadR', skill: 'axeHeadR' },
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'slash',
    tempo: 1.45,
    amplitude: 0.07,
    recoil: 0.5,
  },
  attack: f('斧刃重弧', 'cleave', 'slash', 'bone', 0.335, 9, 7, 0, 0.84, 0.7),
  skill: f('回旋双斧痕', 'cleave', 'slash', 'crack', 0.785, 28, 18, 0, 0.84, 0.7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
