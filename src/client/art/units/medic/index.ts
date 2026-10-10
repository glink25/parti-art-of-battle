import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'medic',
  signature: 'field-medic-cross-pack',
  palette: c(0x58b8aa, 0xf0e4cf, 0x6fffc4, 0xff6f6f),
  parts,
  clips,
  anchors: { attack: 'tip', skill: 'vial' },
  motion: {
    idle: 'breathe',
    attack: 'recoil',
    skill: 'cast',
    tempo: 1.05,
    amplitude: 0.07,
    recoil: 0.2,
  },
  attack: f('注射针弹', 'shot', 'crystal', 'muzzle', 0.405, 11, 9, 0.25, 1.79, 0.82),
  skill: f('医疗微粒缝合', 'mend', 'leaf', 'sigil', 0.855, 30, 20, 0, 1.79, 0.82),
  portrait: { yaw: -0.45, pitch: 0, scale: 1 },
});
