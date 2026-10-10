import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'zen_panda',
  signature: 'meditating-panda-orbit',
  palette: c(0xe8ddd0, 0x252b31, 0xe1a2ff),
  parts,
  clips,
  anchors: { attack: 'palmR', skill: 'orb' },
  motion: {
    idle: 'hover',
    attack: 'punch',
    skill: 'cast',
    tempo: 0.8,
    amplitude: 0.12,
    recoil: 0.28,
  },
  attack: f('禅掌涟纹', 'thrust', 'sigil', 'leaf', 0.44, 13, 9, 0, 1.79, 1.18),
  skill: f('禅意莲华爆发', 'bloom', 'sigil', 'water', 0.89, 32, 20, 0, 1.79, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
