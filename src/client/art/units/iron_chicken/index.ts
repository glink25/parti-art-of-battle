import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'iron_chicken',
  signature: 'armored-rooster-spear-beak',
  palette: c(0x8999a8, 0x4a3d3c, 0xff9b51),
  parts,
  clips,
  anchors: { attack: 'beak', skill: 'beak' },
  motion: {
    idle: 'stalk',
    attack: 'thrust',
    skill: 'charge',
    tempo: 1.55,
    amplitude: 0.11,
    recoil: 0.52,
  },
  attack: f('钢喙穿刺', 'thrust', 'feather', 'muzzle', 0.335, 11, 11, 0, 1.79, 1.3),
  skill: f('钢羽突刺翼痕', 'phase', 'feather', 'slash', 0.785, 30, 22, 0, 1.79, 1.3),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
