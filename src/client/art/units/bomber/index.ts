import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'bomber',
  signature: 'delta-wing-bomb-bay',
  palette: c(0x5abddd, 0x314967, 0xff855a),
  parts,
  clips,
  anchors: { attack: 'noseLamp', skill: 'bombL0' },
  motion: {
    idle: 'hover',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.25,
    amplitude: 0.16,
    recoil: 0.22,
  },
  attack: f('航弹坠落', 'shell', 'fire', 'smoke', 0.3, 13, 9, 1.5, 1.22, 1.18),
  skill: f('燃烧弹幕', 'salvo', 'fire', 'crack', 0.75, 32, 20, 0, 1.22, 1.18),
  portrait: { yaw: 0.35, pitch: 0.12, scale: 0.82 },
});
