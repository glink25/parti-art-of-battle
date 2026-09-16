import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'transform_tower',
  signature: 'folding-panel-transform-tower',
  palette: c(0x789da0, 0x435066, 0xff754f),
  parts,
  clips,
  anchors: { attack: 'cannonMuzzle', skill: 'reactor' },
  motion: {
    idle: 'tower',
    attack: 'recoil',
    skill: 'blast',
    tempo: 0.62,
    amplitude: 0.04,
    recoil: 0.45,
  },
  attack: f('bolt', 'burst', 'box', 'blocks', 0.12, 0.15, 9, 9),
  skill: f('wave', 'shockwave', 'box', 'rings', 0.6, 0.35, 30, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
