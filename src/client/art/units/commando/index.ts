import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'commando',
  signature: 'rail-sniper-tripod',
  palette: c(0x52aa9c, 0x263c48, 0xff5f5f),
  parts,
  clips,
  anchors: { attack: 'muzzle', skill: 'muzzle' },
  motion: {
    idle: 'stalk',
    attack: 'recoil',
    skill: 'brace',
    tempo: 0.95,
    amplitude: 0.04,
    recoil: 0.72,
  },
  attack: f('消焰精确射击', 'shot', 'muzzle', 'crystal', 0.3, 9, 11, 0.25, 1.79, 0.94),
  skill: f('超距狙杀穿甲线', 'shot', 'muzzle', 'lightning', 0.85, 28, 22, 0, 1.79, 0.94),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
