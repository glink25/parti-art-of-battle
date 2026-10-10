import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'arhat',
  signature: 'prayer-beads-palm-cannon',
  palette: c(0xd5a04d, 0x7a5135, 0xffe391),
  parts,
  clips,
  anchors: { attack: 'focus', skill: 'focus' },
  motion: {
    idle: 'breathe',
    attack: 'cast',
    skill: 'punch',
    tempo: 0.85,
    amplitude: 0.09,
    recoil: 0.5,
  },
  attack: f('罗汉掌印', 'thrust', 'sigil', 'slash', 0.44, 15, 9, 0, 1.6, 0.82),
  skill: f('破妄掌印', 'thrust', 'sigil', 'crack', 0.85, 34, 20, 0, 1.6, 0.82),
  portrait: { yaw: -0.32, pitch: 0.02, scale: 1 },
});
