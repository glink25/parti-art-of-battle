import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'lion',
  signature: 'crystal-mane-roaring-beast',
  palette: c(0xe2a647, 0x913f36, 0xffcf58),
  parts,
  clips,
  anchors: { attack: 'nose', skill: 'jaw' },
  motion: {
    idle: 'prowl',
    attack: 'claw',
    skill: 'bite',
    tempo: 0.9,
    amplitude: 0.11,
    recoil: 0.35,
  },
  attack: f('melee', 'shards', 'cone', 'none', 0.22, 0, 8, 3),
  skill: f('wave', 'crystal', 'dodeca', 'rings', 0.6, 0.2, 22, 4),
  portrait: { yaw: 0.35, pitch: 0, scale: 0.92 },
});
