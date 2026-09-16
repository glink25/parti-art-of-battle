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
  attack: f('melee', 'shards', 'box', 'none', 0.2, 0, 6, 2),
  skill: f('wave', 'shockwave', 'torus', 'blocks', 0.5, 0, 16, 1),
  portrait: { yaw: -0.3, pitch: 0, scale: 1.02 },
});
