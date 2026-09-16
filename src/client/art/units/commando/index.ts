import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'commando',
  signature: 'rail-sniper-tripod',
  palette: c(0x52aa9c, 0x263c48, 0xff5f5f),
  parts,
  clips,
  anchors: { attack: 'muzzle', skill: 'muzzle' },
  motion: {
    idle: 'stalk',
    attack: 'recoil',
    skill: 'brace',
    tempo: 0.95,
    amplitude: 0.04,
    recoil: 0.72,
  },
  attack: f('beam', 'crystal', 'cylinder', 'ribbon', 0.1, 0.02, 16, 12),
  skill: f('beam', 'shockwave', 'cylinder', 'sparks', 0.22, 0.02, 28, 15),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
