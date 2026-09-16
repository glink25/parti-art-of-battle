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
  attack: f('bolt', 'burst', 'cylinder', 'sparks', 0.08, 0.05, 7, 12),
  skill: f('bolt', 'crystal', 'cylinder', 'ribbon', 0.12, 0.05, 15, 14),
  portrait: { yaw: -0.5, pitch: 0.02, scale: 0.96 },
});
