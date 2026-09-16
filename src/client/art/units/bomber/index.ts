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
  attack: f('bolt', 'burst', 'cone', 'sparks', 0.1, 0.15, 8, 8),
  skill: f('rain', 'flame', 'ico', 'embers', 0.38, 1.8, 28, 10),
  portrait: { yaw: 0.35, pitch: 0.12, scale: 0.82 },
});
