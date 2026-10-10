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
  attack: f('双管曳光', 'shot', 'muzzle', 'smoke', 0.335, 13, 7, 0.25, 1.79, 0.7),
  skill: f('双炮交替轰击', 'salvo', 'muzzle', 'crack', 0.785, 32, 18, 0, 1.79, 0.7),
  portrait: { yaw: 0.42, pitch: 0.04, scale: 0.92 },
});
