import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'eel',
  signature: 'electric-serpent-coil',
  palette: c(0x56a9c9, 0x344e78, 0x67f4ff),
  parts,
  clips,
  anchors: { attack: 'jaw', skill: 'core' },
  motion: {
    idle: 'coil',
    attack: 'bite',
    skill: 'blast',
    tempo: 1.4,
    amplitude: 0.15,
    recoil: 0.25,
  },
  attack: f('电鳗游弧', 'shot', 'lightning', 'water', 0.37, 9, 11, 0.25, 1.41, 0.94),
  skill: f('电海分叉雷瀑', 'lightning', 'lightning', 'water', 0.82, 28, 22, 0, 1.41, 0.94),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
