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
  attack: f('melee', 'shards', 'cylinder', 'none', 0.16, 0, 8, 5),
  skill: f('wave', 'shockwave', 'torus', 'blocks', 0.62, 0.1, 20, 3),
  portrait: { yaw: -0.38, pitch: 0, scale: 0.98 },
});
