import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'monk_panda',
  signature: 'panda-iron-fist-stance',
  palette: c(0xe6dbcd, 0x292f34, 0xffd25d),
  parts,
  clips,
  anchors: { attack: 'fistR', skill: 'fistL' },
  motion: {
    idle: 'brace',
    attack: 'punch',
    skill: 'brace',
    tempo: 1.15,
    amplitude: 0.07,
    recoil: 0.42,
  },
  attack: f('武僧拳风', 'thrust', 'slash', 'sigil', 0.3, 11, 7, 0, 1.22, 1.06),
  skill: f('护身气劲', 'ward', 'sigil', 'leaf', 0.75, 30, 18, 0, 1.22, 1.06),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
