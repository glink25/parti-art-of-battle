import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'kong',
  signature: 'guardian-gauntlet-halo',
  palette: c(0xd6a54d, 0x70492f, 0xffe27a),
  parts,
  clips,
  anchors: { attack: 'fistR', skill: 'halo' },
  motion: {
    idle: 'brace',
    attack: 'punch',
    skill: 'slam',
    tempo: 1.1,
    amplitude: 0.08,
    recoil: 0.32,
  },
  attack: f('拳锋气压', 'thrust', 'crack', 'sigil', 0.3, 9, 7, 0, 0.65, 0.7),
  skill: f('金刚护体金纹', 'ward', 'sigil', 'crack', 0.75, 28, 18, 0, 0.65, 0.7),
  portrait: { yaw: -0.4, pitch: 0.05, scale: 1.05 },
});
