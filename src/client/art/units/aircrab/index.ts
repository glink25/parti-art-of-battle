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
  attack: f('bolt', 'burst', 'cylinder', 'sparks', 0.11, 0.2, 9, 10),
  skill: f('arc', 'shockwave', 'sphere', 'rings', 0.36, 1.5, 22, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
