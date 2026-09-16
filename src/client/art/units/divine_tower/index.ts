import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { towerParts } from './sculpt';

export default d({
  id: 'divine_tower',
  signature: 'ivory-openwork-reliquary-with-gilded-armillary-crown',
  palette: c(0x78999d, 0x394e62, 0xffe680, 0xd1a852),
  parts: towerParts,
  motion: {
    idle: 'tower',
    attack: 'recoil',
    skill: 'cast',
    tempo: 0.5,
    amplitude: 0.018,
    recoil: 0.35,
  },
  clips: {
    attack: {
      tracks: [
        {
          part: 'crown',
          keyframes: [
            { at: 0, rotation: [0, 0, 0] },
            { at: 0.4, rotation: [0, -0.25, 0] },
            { at: 0.58, rotation: [0, 0.2, 0] },
            { at: 1, rotation: [0, 0, 0] },
          ],
        },
        {
          part: 'eye',
          keyframes: [
            { at: 0, scale: [1, 1, 1] },
            { at: 0.45, scale: [1.8, 1.8, 1.8] },
            { at: 0.65, scale: [0.7, 0.7, 0.7] },
            { at: 1, scale: [1, 1, 1] },
          ],
        },
      ],
    },
    skill: {
      tracks: [
        {
          part: 'crown',
          keyframes: [
            { at: 0, position: [0, 0, 0], rotation: [0, 0, 0] },
            { at: 0.5, position: [0, 0.18, 0], rotation: [0, Math.PI, 0] },
            { at: 1, position: [0, 0, 0], rotation: [0, Math.PI * 2, 0] },
          ],
        },
        {
          part: 'sealOuter',
          keyframes: [
            { at: 0, scale: [0.4, 0.4, 0.4], rotation: [0, 0, 0] },
            { at: 0.55, scale: [1.7, 1.7, 1.7], rotation: [0, 0, Math.PI] },
            { at: 1, scale: [1, 1, 1], rotation: [0, 0, Math.PI * 2] },
          ],
        },
        {
          part: 'sealInner',
          keyframes: [
            { at: 0, rotation: [0, 0, 0] },
            { at: 0.55, rotation: [0, 0, -Math.PI * 1.5] },
            { at: 1, rotation: [0, 0, -Math.PI * 2] },
          ],
        },
        {
          part: 'focus',
          keyframes: [
            { at: 0, position: [0, 0, 0] },
            { at: 0.5, position: [0, 0.35, 0] },
            { at: 1, position: [0, 0, 0] },
          ],
        },
      ],
    },
  },
  anchors: { attack: 'eye', skill: 'focus' },
  attack: f('beam', 'crystal', 'cylinder', 'sparks', 0.08, 0.02, 8, 10),
  skill: f('beam', 'hex', 'octa', 'rings', 0.3, 0.02, 28, 12),
  portrait: { yaw: -0.38, pitch: 0.03, scale: 0.68 },
});
