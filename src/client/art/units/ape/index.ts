import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'ape',
  signature: 'gorilla-mech-piston-fists',
  palette: c(0x8798a7, 0x39414c, 0x6be7ff),
  parts,
  clips,
  anchors: { attack: 'fistR', skill: 'fistL' },
  motion: {
    idle: 'brace',
    attack: 'punch',
    skill: 'slam',
    tempo: 1,
    amplitude: 0.08,
    recoil: 0.52,
  },
  attack: f('melee', 'shards', 'ico', 'blocks', 0.22, 0, 10, 5),
  skill: f('wave', 'shockwave', 'torus', 'blocks', 0.68, 0.15, 24, 3),
  portrait: { yaw: -0.3, pitch: 0.04, scale: 0.9 },
});
