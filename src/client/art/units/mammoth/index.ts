import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'mammoth',
  signature: 'armored-mammoth-tusks',
  palette: c(0xd6a45e, 0x654d42, 0xffc762),
  parts,
  clips,
  anchors: { attack: 'tuskL', skill: 'trunk' },
  motion: {
    idle: 'prowl',
    attack: 'thrust',
    skill: 'charge',
    tempo: 0.72,
    amplitude: 0.08,
    recoil: 0.62,
  },
  attack: f('melee', 'shards', 'cone', 'none', 0.2, 0, 10, 5),
  skill: f('dash', 'shockwave', 'dodeca', 'blocks', 0.55, 0.2, 30, 10),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
