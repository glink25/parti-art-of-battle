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
  attack: f('阔刀斩痕', 'cleave', 'slash', 'bone', 0.3, 13, 11, 0, 0.84, 0.94),
  skill: f('狂刃燃锋', 'ascend', 'slash', 'fire', 0.75, 32, 22, 0, 0.84, 0.94),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
