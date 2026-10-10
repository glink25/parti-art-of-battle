import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'bird_rider',
  signature: 'compact-ground-bird-crossbow-scout',
  palette: c(0xc08b55, 0x6c4a68, 0x7ee8ff),
  parts,
  clips,
  anchors: { attack: 'bolt', skill: 'bolt' },
  motion: {
    idle: 'flutter',
    attack: 'thrust',
    skill: 'charge',
    tempo: 1.5,
    amplitude: 0.2,
    recoil: 0.35,
  },
  attack: f('弩箭羽尾', 'shot', 'feather', 'slash', 0.37, 11, 11, 0.25, 1.22, 1.3),
  skill: f('飞羽连弩', 'salvo', 'feather', 'slash', 0.82, 30, 22, 0, 1.22, 1.3),
  portrait: { yaw: 0.42, pitch: 0.12, scale: 0.84 },
});
