import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'tree',
  signature: 'ancient-root-crown-tree',
  palette: c(0x65766d, 0x4f743e, 0x8dff73),
  parts,
  clips,
  anchors: { attack: 'fingerR1', skill: 'crownL2' },
  motion: {
    idle: 'tower',
    attack: 'slam',
    skill: 'cast',
    tempo: 0.55,
    amplitude: 0.06,
    recoil: 0.54,
  },
  attack: f('老枝敲击', 'thrust', 'root', 'crack', 0.37, 9, 9, 0, 1.22, 1.18),
  skill: f('古树破土禁锢', 'roots', 'root', 'leaf', 0.82, 28, 20, 0, 1.22, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
