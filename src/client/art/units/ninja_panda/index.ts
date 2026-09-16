import { defineUnitArt as d, fx as f, palette as c, part as p } from '../../core/blueprint';
export default d({
  id: 'ninja_panda',
  signature: 'scarf-twin-blade-panda',
  palette: c(0xe7dbcd, 0x242934, 0xeb64ff),
  parts: [
    p('body', 'sphere', 'ivory', [0, 0.56, 0], [0.38, 0.46, 0.34]),
    p('hood', 'sphere', 'dark', [0, 0.94, 0], [0.3, 0.28, 0.3]),
    p('bladeL', 'box', 'secondary', [-0.35, 0.62, -0.25], [0.08, 0.08, 0.6], [0, 0.3, 0.4]),
    p('bladeR', 'box', 'energy', [0.35, 0.62, -0.25], [0.08, 0.08, 0.6], [0, -0.3, -0.4], true),
  ],
  motion: {
    idle: 'stalk',
    attack: 'slash',
    skill: 'slash',
    tempo: 1.75,
    amplitude: 0.08,
    recoil: 0.62,
  },
  attack: f('melee', 'shards', 'box', 'ribbon', 0.2, 0, 11, 15),
  skill: f('dash', 'vortex', 'box', 'ribbon', 0.5, 0.25, 32, 20),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
