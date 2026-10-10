import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'flame',
  signature: 'fuel-tank-flame-nozzle',
  palette: c(0x57b3a3, 0x55423b, 0xff6a36),
  parts,
  clips,
  anchors: { attack: 'nozzle', skill: 'nozzle' },
  motion: {
    idle: 'brace',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.2,
    amplitude: 0.06,
    recoil: 0.34,
  },
  attack: f('喷口火舌', 'breath', 'fire', 'smoke', 0.405, 9, 7, 0, 1.79, 0.7),
  skill: f('持续火焰喷流', 'breath', 'fire', 'crack', 0.855, 28, 18, 0, 1.79, 0.7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
