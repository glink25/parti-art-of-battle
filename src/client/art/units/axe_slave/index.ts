import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'axe_slave',
  signature: 'dual-axe-puppet',
  palette: c(0xa9855e, 0x523f45, 0xff7858),
  parts,
  clips,
  anchors: { attack: 'axeHeadR', skill: 'axeHeadR' },
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'slash',
    tempo: 1.45,
    amplitude: 0.07,
    recoil: 0.5,
  },
  attack: f('melee', 'shards', 'cone', 'none', 0.24, 0, 10, 8),
  skill: f('wave', 'shards', 'cone', 'ribbon', 0.46, 0.1, 22, 12),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
