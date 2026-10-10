import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'vine',
  signature: 'twisted-vine-humanoid',
  palette: c(0x697b78, 0x49723e, 0x83ff82),
  parts,
  clips,
  anchors: { attack: 'thornR2', skill: 'thornL2' },
  motion: {
    idle: 'coil',
    attack: 'claw',
    skill: 'cast',
    tempo: 0.72,
    amplitude: 0.1,
    recoil: 0.28,
  },
  attack: f('藤鞭抽击', 'thrust', 'root', 'leaf', 0.335, 15, 9, 0, 1.22, 0.82),
  skill: f('荆棘攀缠', 'roots', 'root', 'leaf', 0.785, 34, 20, 0, 1.22, 0.82),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
