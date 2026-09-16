import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'ark',
  signature: 'carrier-drone-bays',
  palette: c(0x5fbddc, 0x344c65, 0x7effe6),
  parts,
  clips,
  anchors: { attack: 'turretMuzzle', skill: 'droneCore' },
  motion: {
    idle: 'hover',
    attack: 'recoil',
    skill: 'cast',
    tempo: 0.8,
    amplitude: 0.12,
    recoil: 0.3,
  },
  attack: f('bolt', 'burst', 'cone', 'sparks', 0.1, 0.2, 8, 8),
  skill: f('summon', 'vortex', 'octa', 'rings', 0.48, 0.8, 30, 12),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
