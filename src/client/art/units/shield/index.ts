import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'shield',
  signature: 'tower-shield-baton',
  palette: c(0x49b8a5, 0x2c6570, 0x7fffe1),
  parts,
  clips,
  anchors: { attack: 'batonTip', skill: 'shield' },
  motion: {
    idle: 'brace',
    attack: 'slam',
    skill: 'charge',
    tempo: 1.3,
    amplitude: 0.06,
    recoil: 0.24,
  },
  attack: f('盾棍电击', 'thrust', 'muzzle', 'crack', 0.335, 11, 9, 0, 0.84, 0.82),
  skill: f('盾击震慑', 'thrust', 'crystal', 'muzzle', 0.65, 30, 20, 0, 0.84, 0.82),
  portrait: { yaw: -0.3, pitch: 0, scale: 1.02 },
});
