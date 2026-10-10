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
  attack: f('腐液吐沫', 'breath', 'acid', 'smoke', 0.44, 11, 9, 0, 0.65, 0.82),
  skill: f('腐蚀吐息毒雾', 'breath', 'acid', 'web', 0.89, 30, 20, 0, 0.65, 0.82),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
