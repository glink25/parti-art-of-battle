import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'ninja_panda',
  signature: 'scarf-twin-blade-panda',
  palette: c(0xe7dbcd, 0x242934, 0xeb64ff),
  parts,
  clips,
  anchors: { attack: 'bladeR', skill: 'bladeL' },
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'slash',
    tempo: 1.75,
    amplitude: 0.08,
    recoil: 0.62,
  },
  attack: f('双刃交错', 'cut', 'slash', 'smoke', 0.3, 9, 9, 0, 1.6, 1.18),
  skill: f('影分身交叉斩', 'shadow', 'slash', 'soul', 0.75, 28, 20, 0, 1.6, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
