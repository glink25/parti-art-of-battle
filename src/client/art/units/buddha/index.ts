import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'buddha',
  signature: 'sun-disc-war-staff',
  palette: c(0xd6a34e, 0x7d3f32, 0xffe66c),
  parts,
  clips,
  anchors: { attack: 'staffTipR', skill: 'staffTipR' },
  motion: {
    idle: 'brace',
    attack: 'slash',
    skill: 'slam',
    tempo: 0.9,
    amplitude: 0.09,
    recoil: 0.64,
  },
  attack: f('金箍棍风', 'sweep', 'slash', 'sigil', 0.335, 11, 9, 0, 1.6, 0.82),
  skill: f('斗战金焰横扫', 'sweep', 'slash', 'fire', 0.785, 30, 20, 0, 1.6, 0.82),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
