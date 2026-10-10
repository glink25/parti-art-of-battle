import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'dragon',
  signature: 'serpentine-horned-dragon',
  palette: c(0xd5a04f, 0x72452e, 0x77ecff),
  parts,
  clips,
  anchors: { attack: 'muzzle', skill: 'pearl' },
  motion: { idle: 'coil', attack: 'claw', skill: 'slam', tempo: 1.1, amplitude: 0.14, recoil: 0.4 },
  attack: f('龙息火舌', 'breath', 'fire', 'smoke', 0.3, 11, 9, 0, 1.41, 0.82),
  skill: f('翔龙震荡气浪', 'wave', 'soul', 'sigil', 0.88, 30, 20, 0, 1.41, 0.82),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
