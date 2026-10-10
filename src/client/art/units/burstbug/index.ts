import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'burstbug',
  signature: 'volatile-glowing-abdomen',
  palette: c(0x74b949, 0x3c642f, 0xff6d42),
  parts,
  clips,
  anchors: { attack: 'mandibleL', skill: 'abdomen' },
  motion: {
    idle: 'coil',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.7,
    amplitude: 0.13,
    recoil: 0.2,
  },
  attack: f('虫颚酸星', 'thrust', 'acid', 'bone', 0.37, 15, 9, 0, 0.65, 0.82),
  skill: f('腹囊爆裂酸焰', 'quake', 'acid', 'fire', 0.82, 34, 20, 0, 0.65, 0.82),
  portrait: { yaw: 0.25, pitch: 0.1, scale: 0.9 },
});
