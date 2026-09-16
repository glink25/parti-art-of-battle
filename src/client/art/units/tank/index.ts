import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'tank',
  signature: 'tracked-counterweight-catapult',
  palette: c(0x8796a5, 0x404957, 0xffbb58),
  parts,
  clips,
  anchors: { attack: 'stone', skill: 'stone' },
  motion: {
    idle: 'brace',
    attack: 'recoil',
    skill: 'brace',
    tempo: 0.7,
    amplitude: 0.04,
    recoil: 0.62,
  },
  attack: f('arc', 'shards', 'dodeca', 'blocks', 0.18, 1.8, 10, 7),
  skill: f('arc', 'shockwave', 'dodeca', 'rings', 0.34, 2.2, 24, 9),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
