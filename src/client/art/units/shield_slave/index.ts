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
  attack: f('木盾横击', 'cleave', 'slash', 'bone', 0.405, 15, 7, 0, 1.22, 1.06),
  skill: f('傀儡盾篆', 'ward', 'sigil', 'bone', 0.855, 34, 18, 0, 1.22, 1.06),
  portrait: { yaw: -0.3, pitch: 0.02, scale: 1 },
});
