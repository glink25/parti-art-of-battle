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
  attack: f('焊枪电星', 'shot', 'lightning', 'muzzle', 0.44, 13, 11, 0.25, 0.65, 0.94),
  skill: f('维修焊花束', 'mend', 'lightning', 'crystal', 0.89, 32, 22, 0, 0.65, 0.94),
  portrait: { yaw: 0.35, pitch: 0.12, scale: 1 },
});
