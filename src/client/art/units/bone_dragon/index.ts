import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';

import { parts, clips } from './sculpt';
export default d({
  id: 'bone_dragon',
  signature: 'skeletal-wyvern-with-layered-skull-jointed-wings-and-segmented-spine',
  palette: c(0xa48b76, 0x4a3a50, 0xcd8cff, 0xd7c8ad),
  parts,
  clips,
  anchors: { attack: 'snout', skill: 'soul' },
  motion: {
    idle: 'flutter',
    attack: 'bite',
    skill: 'blast',
    tempo: 0.82,
    amplitude: 0.11,
    recoil: 0.45,
  },
  attack: f('亡骨魂矛', 'shot', 'bone', 'soul', 0.37, 15, 7, 0.25, 1.79, 1.06),
  skill: f('亡骨幽魂风暴', 'storm', 'soul', 'bone', 0.82, 34, 18, 0, 1.79, 1.06),
  portrait: { yaw: -0.42, pitch: -0.05, scale: 0.62 },
});
