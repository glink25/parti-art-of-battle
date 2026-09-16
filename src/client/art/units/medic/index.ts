import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'medic',
  signature: 'field-medic-cross-pack',
  palette: c(0x58b8aa, 0xf0e4cf, 0x6fffc4, 0xff6f6f),
  parts,
  clips,
  anchors: { attack: 'tip', skill: 'vial' },
  motion: {
    idle: 'breathe',
    attack: 'recoil',
    skill: 'cast',
    tempo: 1.05,
    amplitude: 0.07,
    recoil: 0.2,
  },
  attack: f('bolt', 'burst', 'cylinder', 'none', 0.09, 0.1, 6, 5),
  skill: f('beam', 'flower', 'octa', 'rings', 0.22, 0.1, 20, 4),
  portrait: { yaw: -0.45, pitch: 0, scale: 1 },
});
