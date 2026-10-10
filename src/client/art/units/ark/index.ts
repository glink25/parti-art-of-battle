import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { parts, clips } from './sculpt';
export default d({
  id: 'ark',
  signature: 'carrier-drone-bays',
  palette: c(0x5fbddc, 0x344c65, 0x7effe6),
  parts,
  clips,
  anchors: { attack: 'turretMuzzle', skill: 'droneCore' },
  motion: {
    idle: 'hover',
    attack: 'recoil',
    skill: 'cast',
    tempo: 0.8,
    amplitude: 0.12,
    recoil: 0.3,
  },
  attack: f('舰炮航迹', 'shot', 'muzzle', 'water', 0.335, 13, 11, 0.25, 1.6, 0.94),
  skill: f('甲板机群放飞', 'launch', 'feather', 'muzzle', 0.785, 32, 22, 0.25, 1.6, 0.94),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
