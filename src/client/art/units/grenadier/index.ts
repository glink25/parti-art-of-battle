import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'grenadier',
  signature: 'grenade-launcher-bandolier',
  palette: c(0x55b5a5, 0x35444c, 0xc783ff),
  parts,
  clips,
  anchors: { attack: 'muzzle', skill: 'grenade' },
  motion: {
    idle: 'stalk',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.25,
    amplitude: 0.06,
    recoil: 0.48,
  },
  attack: f('arc', 'burst', 'ico', 'embers', 0.13, 1.4, 9, 10),
  skill: f('arc', 'vortex', 'ico', 'rings', 0.35, 1.8, 25, 12),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
