import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'repair',
  signature: 'four-arm-hover-repair-drone',
  palette: c(0x61c4dd, 0x3b5668, 0x72ffd9),
  parts,
  clips,
  anchors: { attack: 'tip', skill: 'wristR' },
  motion: {
    idle: 'hover',
    attack: 'recoil',
    skill: 'cast',
    tempo: 1.6,
    amplitude: 0.18,
    recoil: 0.16,
  },
  attack: f('bolt', 'burst', 'octa', 'sparks', 0.08, 0.2, 7, 10),
  skill: f('beam', 'hex', 'octa', 'rings', 0.2, 0.1, 18, 6),
  portrait: { yaw: 0.35, pitch: 0.12, scale: 1 },
});
