import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'blade_slave',
  signature: 'twin-cleaver-puppet',
  palette: c(0xa7855d, 0x4d3c45, 0xff5c62),
  parts,
  clips,
  anchors: { attack: 'cleaverR', skill: 'cleaverR' },
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'slash',
    tempo: 1.6,
    amplitude: 0.08,
    recoil: 0.56,
  },
  attack: f('melee', 'shards', 'box', 'ribbon', 0.22, 0, 11, 12),
  skill: f('wave', 'shards', 'box', 'ribbon', 0.5, 0.15, 26, 16),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
