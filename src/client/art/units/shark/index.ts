import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'shark',
  signature: 'floating-shark-puppet-sigil',
  palette: c(0x54a8c5, 0x3c5266, 0x80efff),
  parts,
  clips,
  anchors: { attack: 'mouth', skill: 'summonCore' },
  motion: {
    idle: 'hover',
    attack: 'bite',
    skill: 'cast',
    tempo: 0.9,
    amplitude: 0.15,
    recoil: 0.42,
  },
  attack: f('鲨鳍破浪', 'wave', 'water', 'slash', 0.44, 9, 11, 0, 1.03, 0.94),
  skill: f('须弥化身水门', 'portal', 'water', 'sigil', 0.89, 28, 22, 0, 1.03, 0.94),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
