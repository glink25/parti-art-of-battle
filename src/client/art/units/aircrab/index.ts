import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'aircrab',
  signature: 'hover-crab-cannon-claws',
  palette: c(0x56aec8, 0x315b70, 0x71efff),
  parts,
  clips,
  anchors: { attack: 'cannonMuzzle', skill: 'cannonMuzzle' },
  motion: {
    idle: 'hover',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.2,
    amplitude: 0.14,
    recoil: 0.5,
  },
  attack: f('蟹炮水雾', 'shell', 'water', 'smoke', 0.405, 15, 11, 1.5, 1.03, 1.3),
  skill: f('威胁锁定炮弹', 'shell', 'fire', 'water', 0.855, 34, 22, 1.5, 1.03, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
