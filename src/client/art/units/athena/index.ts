import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'athena',
  signature: 'crystal-orbit-psychic-fighter',
  palette: c(0xe06b78, 0x68437e, 0xff8de8),
  parts,
  clips,
  anchors: { attack: 'crystalR', skill: 'crystalL' },
  motion: {
    idle: 'hover',
    attack: 'punch',
    skill: 'cast',
    tempo: 1.25,
    amplitude: 0.13,
    recoil: 0.38,
  },
  attack: f('灵能晶矢', 'shot', 'crystal', 'soul', 0.405, 13, 9, 0.25, 1.03, 1.18),
  skill: f('闪光水晶波', 'prism', 'crystal', 'sigil', 0.855, 32, 20, 0, 1.03, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
