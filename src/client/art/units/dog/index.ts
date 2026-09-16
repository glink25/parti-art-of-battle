import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'dog',
  signature: 'quadruped-twin-cannon',
  palette: c(0x8d9cae, 0x394854, 0xff8f54),
  parts,
  clips,
  anchors: { attack: 'cannonLMuzzle', skill: 'cannonRMuzzle' },
  motion: {
    idle: 'stalk',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.45,
    amplitude: 0.05,
    recoil: 0.48,
  },
  attack: f('bolt', 'burst', 'cylinder', 'embers', 0.1, 0.1, 8, 7),
  skill: f('rain', 'flame', 'ico', 'embers', 0.3, 1.4, 22, 9),
  portrait: { yaw: 0.42, pitch: 0.04, scale: 0.92 },
});
