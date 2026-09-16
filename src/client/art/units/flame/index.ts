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
  attack: f('breath', 'flame', 'cone', 'embers', 0.2, 0.1, 14, 6),
  skill: f('breath', 'flame', 'cone', 'embers', 0.5, 0.15, 32, 9),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
