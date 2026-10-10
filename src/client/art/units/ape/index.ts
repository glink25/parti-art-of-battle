import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'ape',
  signature: 'gorilla-mech-piston-fists',
  palette: c(0x8798a7, 0x39414c, 0x6be7ff),
  parts,
  clips,
  anchors: { attack: 'fistR', skill: 'fistL' },
  motion: {
    idle: 'brace',
    attack: 'punch',
    skill: 'slam',
    tempo: 1,
    amplitude: 0.08,
    recoil: 0.52,
  },
  attack: f('钢拳冲压', 'thrust', 'crack', 'muzzle', 0.405, 9, 11, 0, 0.84, 0.94),
  skill: f('重拳碎地', 'quake', 'crack', 'smoke', 0.855, 28, 22, 0, 0.84, 0.94),
  portrait: { yaw: -0.3, pitch: 0.04, scale: 0.9 },
});
