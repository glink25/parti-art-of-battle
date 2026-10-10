import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';

export default d({
  id: 'ukyo',
  signature: 'layered-white-haired-iaijutsu-duelist-with-tailored-coat-and-complete-katana',
  palette: c(0xc95b53, 0x33435f, 0x8fdcff, 0xe8bd72),
  parts,
  clips,
  anchors: { attack: 'bladeTip', skill: 'bladeTip' },
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'slash',
    tempo: 1.45,
    amplitude: 0.045,
    recoil: 0.64,
  },
  attack: f('居合薄刃', 'cut', 'slash', 'leaf', 0.335, 9, 11, 0, 0.65, 0.94),
  skill: f('秘剑细雪', 'snow', 'slash', 'crystal', 0.785, 28, 22, 0, 0.65, 0.94),
  portrait: { yaw: -0.48, pitch: 0.04, scale: 0.78 },
});
