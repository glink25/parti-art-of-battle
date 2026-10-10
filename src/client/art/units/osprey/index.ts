import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'osprey',
  signature: 'razor-osprey-talons',
  palette: c(0x55a9c6, 0x4a5268, 0x79eeff),
  parts,
  clips,
  anchors: { attack: 'clawL1', skill: 'beak' },
  motion: {
    idle: 'flutter',
    attack: 'claw',
    skill: 'charge',
    tempo: 1.7,
    amplitude: 0.2,
    recoil: 0.48,
  },
  attack: f('灵鹫爪风', 'cut', 'feather', 'slash', 0.405, 13, 11, 0, 1.22, 0.94),
  skill: f('扑杀羽流', 'phase', 'feather', 'water', 0.855, 32, 22, 0, 1.22, 0.94),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
