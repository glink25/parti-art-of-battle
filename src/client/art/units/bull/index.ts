import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'bull',
  signature: 'horned-bull-great-club',
  palette: c(0xd1a05c, 0x663d35, 0xff704d),
  parts,
  clips,
  anchors: { attack: 'club', skill: 'jaw' },
  motion: {
    idle: 'brace',
    attack: 'slam',
    skill: 'slam',
    tempo: 0.72,
    amplitude: 0.07,
    recoil: 0.68,
  },
  attack: f('melee', 'shards', 'cylinder', 'blocks', 0.25, 0, 11, 5),
  skill: f('wave', 'shockwave', 'torus', 'blocks', 0.72, 0.2, 38, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
