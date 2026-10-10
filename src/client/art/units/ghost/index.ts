import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'ghost',
  signature: 'stealth-delta-phase-jet',
  palette: c(0x62bddb, 0x393d67, 0xb67bff),
  parts,
  clips,
  anchors: { attack: 'visor', skill: 'phaseCore' },
  motion: {
    idle: 'hover',
    attack: 'recoil',
    skill: 'charge',
    tempo: 1.5,
    amplitude: 0.16,
    recoil: 0.4,
  },
  attack: f('相位翼刃', 'cut', 'slash', 'lightning', 0.44, 15, 7, 0, 1.41, 1.06),
  skill: f('幽灵折跃残像', 'phase', 'soul', 'lightning', 0.89, 34, 18, 0, 1.41, 1.06),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
