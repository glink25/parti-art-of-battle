import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'thunder',
  signature: 'thunder-wings-double-drum',
  palette: c(0x8c70cc, 0x4b3f79, 0x64efff),
  parts,
  clips,
  anchors: { attack: 'hammerHeadR', skill: 'hammerHeadL' },
  motion: {
    idle: 'flutter',
    attack: 'cast',
    skill: 'blast',
    tempo: 1.25,
    amplitude: 0.17,
    recoil: 0.3,
  },
  attack: f('雷锤电矢', 'shot', 'lightning', 'feather', 0.405, 13, 7, 0.25, 1.41, 0.7),
  skill: f('雷鼓霹雳', 'lightning', 'lightning', 'sigil', 0.855, 32, 18, 0, 1.41, 0.7),
  portrait: { yaw: -0.35, pitch: 0.08, scale: 0.96 },
});
