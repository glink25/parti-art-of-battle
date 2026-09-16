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
  attack: f('bolt', 'burst', 'cone', 'sparks', 0.08, 0.1, 9, 12),
  skill: f('dash', 'vortex', 'octa', 'ribbon', 0.42, 0.4, 30, 18),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
