import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'tank',
  signature: 'tracked-counterweight-catapult',
  palette: c(0x8796a5, 0x404957, 0xffbb58),
  parts,
  clips,
  anchors: { attack: 'stone', skill: 'stone' },
  motion: {
    idle: 'brace',
    attack: 'recoil',
    skill: 'brace',
    tempo: 0.7,
    amplitude: 0.04,
    recoil: 0.62,
  },
  attack: f('抛石碎屑', 'shell', 'crack', 'smoke', 0.44, 9, 7, 1.5, 1.22, 0.7),
  skill: f('架炮压力蒸汽', 'ascend', 'smoke', 'muzzle', 0.8, 28, 18, 0, 1.22, 0.7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
