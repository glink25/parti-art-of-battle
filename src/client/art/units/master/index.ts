import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'master',
  signature: 'puppet-master-string-crown',
  palette: c(0x9777cc, 0x554172, 0xd59aff),
  parts,
  clips,
  anchors: { attack: 'focus', skill: 'puppet' },
  motion: {
    idle: 'hover',
    attack: 'cast',
    skill: 'cast',
    tempo: 0.72,
    amplitude: 0.13,
    recoil: 0.2,
  },
  attack: f('操偶丝刃', 'shot', 'sigil', 'slash', 0.37, 13, 7, 0.25, 0.65, 0.7),
  skill: f('刀奴符纸幻象', 'portal', 'sigil', 'slash', 0.82, 32, 18, 0, 0.65, 0.7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
