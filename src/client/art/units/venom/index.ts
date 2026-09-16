import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'venom',
  signature: 'toxic-sac-corrosive-beast',
  palette: c(0xd2a257, 0x53683c, 0xa5ff49),
  parts,
  clips,
  anchors: { attack: 'breath', skill: 'breath' },
  motion: {
    idle: 'prowl',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.05,
    amplitude: 0.1,
    recoil: 0.35,
  },
  attack: f('melee', 'burst', 'cone', 'none', 0.18, 0, 9, 5),
  skill: f('breath', 'vortex', 'sphere', 'ribbon', 0.48, 0.25, 28, 8),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
