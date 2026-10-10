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
  attack: f('榴弹弧线', 'shell', 'muzzle', 'smoke', 0.405, 11, 7, 1.5, 1.6, 1.06),
  skill: f('灵能手雷爆燃', 'shell', 'fire', 'sigil', 0.855, 30, 18, 1.5, 1.6, 1.06),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
