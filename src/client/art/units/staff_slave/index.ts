import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'staff_slave',
  signature: 'long-staff-puppet-mask',
  palette: c(0xa98258, 0x57464c, 0xff8d63),
  parts,
  clips,
  anchors: { attack: 'tipR', skill: 'tipR' },
  motion: {
    idle: 'stalk',
    attack: 'thrust',
    skill: 'slam',
    tempo: 1.2,
    amplitude: 0.07,
    recoil: 0.42,
  },
  attack: f('长棍圆扫', 'sweep', 'slash', 'sigil', 0.44, 9, 9, 0, 1.41, 1.18),
  skill: f('撼地棍裂纹', 'quake', 'crack', 'slash', 0.9, 28, 20, 0, 1.41, 1.18),
  portrait: { yaw: -0.38, pitch: 0, scale: 0.98 },
});
