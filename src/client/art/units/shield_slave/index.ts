import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'shield_slave',
  signature: 'wood-puppet-gate-shield',
  palette: c(0xb18b62, 0x604a43, 0xd8aeff),
  parts,
  clips,
  anchors: { attack: 'gate', skill: 'gate' },
  motion: {
    idle: 'stalk',
    attack: 'slam',
    skill: 'brace',
    tempo: 0.85,
    amplitude: 0.05,
    recoil: 0.28,
  },
  attack: f('melee', 'shards', 'box', 'blocks', 0.2, 0, 7, 1),
  skill: f('wave', 'hex', 'octa', 'rings', 0.5, 0, 15, 2),
  portrait: { yaw: -0.3, pitch: 0.02, scale: 1 },
});
