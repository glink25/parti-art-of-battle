import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'mammoth',
  signature: 'armored-mammoth-tusks',
  palette: c(0xd6a45e, 0x654d42, 0xffc762),
  parts,
  clips,
  anchors: { attack: 'tuskL', skill: 'trunk' },
  motion: {
    idle: 'prowl',
    attack: 'thrust',
    skill: 'charge',
    tempo: 0.72,
    amplitude: 0.08,
    recoil: 0.62,
  },
  attack: f('象牙撼击', 'cleave', 'crack', 'smoke', 0.335, 13, 9, 0, 1.41, 1.18),
  skill: f('巨象奔袭尘浪', 'phase', 'crack', 'bone', 0.785, 32, 20, 0, 1.41, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
