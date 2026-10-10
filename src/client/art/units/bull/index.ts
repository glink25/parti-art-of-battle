import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'bull',
  signature: 'horned-bull-great-club',
  palette: c(0xd1a05c, 0x663d35, 0xff704d),
  parts,
  clips,
  anchors: { attack: 'club', skill: 'jaw' },
  motion: {
    idle: 'brace',
    attack: 'slam',
    skill: 'slam',
    tempo: 0.72,
    amplitude: 0.07,
    recoil: 0.68,
  },
  attack: f('重棍裂击', 'cleave', 'crack', 'slash', 0.3, 9, 7, 0, 1.41, 0.7),
  skill: f('撼地怒吼裂隙', 'quake', 'crack', 'fire', 0.75, 28, 18, 0, 1.41, 0.7),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
