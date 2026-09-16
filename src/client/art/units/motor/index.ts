import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'motor',
  signature: 'twin-wheel-outrider',
  palette: c(0xc58d55, 0x4c4245, 0xb5ff48),
  parts,
  clips,
  anchors: { attack: 'nozzleMuzzle', skill: 'helmet' },
  motion: {
    idle: 'roll',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.5,
    amplitude: 0.06,
    recoil: 0.38,
  },
  attack: f('bolt', 'burst', 'cylinder', 'embers', 0.1, 0.15, 7, 6),
  skill: f('arc', 'vortex', 'sphere', 'ribbon', 0.32, 1.2, 20, 8),
  portrait: { yaw: 0.5, pitch: 0.02, scale: 0.92 },
});
