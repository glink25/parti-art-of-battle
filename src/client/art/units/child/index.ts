import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'child',
  signature: 'small-orbiting-spirit-orbs',
  palette: c(0x9a7bd0, 0x56418a, 0x76f4ff),
  parts,
  clips,
  anchors: { attack: 'orbR', skill: 'orbL' },
  motion: {
    idle: 'hover',
    attack: 'cast',
    skill: 'cast',
    tempo: 1.4,
    amplitude: 0.16,
    recoil: 0.12,
  },
  attack: f('灵珠星尾', 'shot', 'soul', 'sigil', 0.37, 9, 7, 0.25, 1.6, 0.7),
  skill: f('灵珠回能流光', 'bloom', 'sigil', 'leaf', 0.82, 28, 18, 0, 1.6, 0.7),
  portrait: { yaw: -0.25, pitch: 0.06, scale: 1.08 },
});
