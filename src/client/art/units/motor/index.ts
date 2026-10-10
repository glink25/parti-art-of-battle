import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'motor',
  signature: 'twin-wheel-outrider',
  palette: c(0xc58d55, 0x4c4245, 0xb5ff48),
  parts,
  clips,
  anchors: { attack: 'nozzleMuzzle', skill: 'helmet' },
  motion: {
    idle: 'roll',
    attack: 'recoil',
    skill: 'blast',
    tempo: 1.5,
    amplitude: 0.06,
    recoil: 0.38,
  },
  attack: f('骑枪短焰', 'shot', 'muzzle', 'fire', 0.44, 11, 7, 0.25, 1.03, 1.06),
  skill: f('焦油弹烟焰', 'shell', 'smoke', 'fire', 0.72, 30, 18, 0, 1.03, 1.06),
  portrait: { yaw: 0.5, pitch: 0.02, scale: 0.92 },
});
