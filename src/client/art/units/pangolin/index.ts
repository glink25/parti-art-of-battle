import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'pangolin',
  signature: 'rolling-armored-pangolin',
  palette: c(0xd5a35e, 0x6e5b49, 0xffd66d),
  parts,
  clips,
  anchors: { attack: 'foreRFoot', skill: 'nose' },
  motion: {
    idle: 'roll',
    attack: 'claw',
    skill: 'charge',
    tempo: 1.6,
    amplitude: 0.1,
    recoil: 0.56,
  },
  attack: f('melee', 'shards', 'cone', 'blocks', 0.18, 0, 9, 8),
  skill: f('dash', 'shockwave', 'dodeca', 'blocks', 0.42, 0.25, 24, 14),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
