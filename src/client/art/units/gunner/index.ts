import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'gunner',
  signature: 'long-rifle-marksman-scarf',
  palette: c(0x56b8a8, 0x263f48, 0xffdd62),
  parts,
  clips,
  anchors: { attack: 'muzzle', skill: 'muzzle' },
  motion: {
    idle: 'stalk',
    attack: 'recoil',
    skill: 'brace',
    tempo: 1.2,
    amplitude: 0.05,
    recoil: 0.56,
  },
  attack: f('步枪细曳光', 'shot', 'muzzle', 'smoke', 0.335, 9, 9, 0.25, 1.03, 1.18),
  skill: f('超频枪膛充能', 'ascend', 'muzzle', 'crystal', 0.6, 28, 20, 0, 1.03, 1.18),
  portrait: { yaw: -0.5, pitch: 0.02, scale: 0.96 },
});
