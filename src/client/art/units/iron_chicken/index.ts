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
  attack: f('melee', 'shards', 'cone', 'needles', 0.16, 0, 9, 11),
  skill: f('dash', 'burst', 'cone', 'sparks', 0.38, 0.25, 24, 16),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
