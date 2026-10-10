import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'sword_slave',
  signature: 'single-long-sword-puppet',
  palette: c(0xa9875f, 0x50404a, 0x74dfff),
  parts,
  clips,
  anchors: { attack: 'blade', skill: 'blade' },
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'brace',
    tempo: 1.25,
    amplitude: 0.06,
    recoil: 0.5,
  },
  attack: f('直剑冷光', 'cut', 'slash', 'sigil', 0.37, 15, 11, 0, 1.6, 1.3),
  skill: f('剑势锋芒', 'ascend', 'slash', 'sigil', 0.82, 34, 22, 0, 1.6, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
