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
  attack: f('变形炮弹', 'shell', 'muzzle', 'crystal', 0.3, 15, 9, 1.5, 1.79, 0.82),
  skill: f('四瓣装甲能量重构', 'ascend', 'crystal', 'lightning', 0.75, 34, 20, 0, 1.79, 0.82),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
