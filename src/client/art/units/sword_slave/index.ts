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
  attack: f('melee', 'shards', 'box', 'ribbon', 0.18, 0, 10, 9),
  skill: f('wave', 'crystal', 'box', 'ribbon', 0.4, 0.15, 22, 12),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
