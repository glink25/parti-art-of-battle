import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';

import { parts, clips } from './sculpt';
export default d({
  id: 'wolf',
  signature: 'anatomical-rift-direwolf-with-layered-pelt-and-articulated-paws',
  palette: c(0x8f7459, 0x353a4d, 0x9d7cff, 0xc9aa72),
  parts,
  clips,
  anchors: { attack: 'nose', skill: 'rift' },
  motion: {
    idle: 'prowl',
    attack: 'bite',
    skill: 'cast',
    tempo: 1.35,
    amplitude: 0.06,
    recoil: 0.38,
  },
  attack: f('melee', 'shards', 'cone', 'none', 0.17, 0, 9, 7),
  skill: f('summon', 'vortex', 'ico', 'ribbon', 0.48, 0.65, 26, 10),
  portrait: { yaw: -0.45, pitch: -0.08, scale: 0.72 },
});
