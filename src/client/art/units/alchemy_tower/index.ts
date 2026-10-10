import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'alchemy_tower',
  signature: 'alchemy-vials-orb-tower',
  palette: c(0x73a0a2, 0x46606b, 0xffd55f),
  parts,
  clips,
  anchors: { attack: 'elixir', skill: 'elixir' },
  motion: {
    idle: 'tower',
    attack: 'recoil',
    skill: 'cast',
    tempo: 0.45,
    amplitude: 0.03,
    recoil: 0.16,
  },
  attack: f('无普攻', 'shot', 'acid', 'smoke', 0.405, 11, 11, 0.25, 1.41, 1.3),
  skill: f('炼金蒸馏灵雾', 'ascend', 'acid', 'sigil', 0.855, 30, 22, 0, 1.41, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
