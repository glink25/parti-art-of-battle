import { parts, clips } from './sculpt';
import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
export default d({
  id: 'nakoruru',
  signature: 'hawk-companion-dagger',
  palette: c(0xde685b, 0x564465, 0xffe77b),
  parts,
  clips,
  anchors: { attack: 'dagger', skill: 'hawkHead' },
  motion: {
    idle: 'breathe',
    attack: 'slash',
    skill: 'charge',
    tempo: 1.6,
    amplitude: 0.09,
    recoil: 0.5,
  },
  attack: f('短刀羽痕', 'cut', 'slash', 'feather', 0.37, 11, 7, 0, 0.84, 1.06),
  skill: f('飞鹰俯冲翼影', 'phase', 'feather', 'leaf', 0.82, 30, 18, 0, 0.84, 1.06),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
