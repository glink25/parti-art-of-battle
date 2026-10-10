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
  attack: f('鳞爪刮痕', 'cut', 'slash', 'crack', 0.37, 11, 9, 0, 1.03, 0.82),
  skill: f('钻地破土突进', 'phase', 'crack', 'smoke', 0.82, 30, 20, 0, 1.03, 0.82),
  portrait: { yaw: -0.35, pitch: 0.05, scale: 0.94 },
});
