import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'whale',
  signature: 'floating-whale-wave-fins',
  palette: c(0x54a8c8, 0x315b78, 0x86f6ff),
  parts,
  clips,
  anchors: { attack: 'jaw', skill: 'spout' },
  motion: {
    idle: 'hover',
    attack: 'slam',
    skill: 'blast',
    tempo: 0.7,
    amplitude: 0.18,
    recoil: 0.3,
  },
  attack: f('鳍击水涌', 'wave', 'water', 'smoke', 0.405, 9, 9, 0, 0.65, 1.18),
  skill: f('幻海卷浪潮汐', 'wave', 'water', 'leaf', 0.855, 28, 20, 0, 0.65, 1.18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
