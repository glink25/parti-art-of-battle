import { defineUnitArt as d, fx as f, palette as c } from '../../core/blueprint';
import { titanParts } from './sculpt';

export default d({
  id: 'titan',
  signature: 'gilded-naval-reactor-titan-with-machined-plate-armour',
  palette: { ...c(0x405e69, 0x26323e, 0xffbd3f, 0xb89555), ivory: 0xd5d3bd },
  parts: titanParts,
  motion: {
    idle: 'brace',
    attack: 'recoil',
    skill: 'blast',
    tempo: 0.65,
    amplitude: 0.025,
    recoil: 0.7,
  },
  clips: {
    attack: {
      tracks: [
        {
          part: 'armL',
          keyframes: [
            { at: 0, rotation: [0, 0, 0] },
            { at: 0.35, rotation: [-0.45, 0, -0.25] },
            { at: 0.58, rotation: [0.65, 0, 0.2] },
            { at: 1, rotation: [0, 0, 0] },
          ],
        },
        {
          part: 'torso',
          keyframes: [
            { at: 0, rotation: [0, 0, 0] },
            { at: 0.58, rotation: [0.12, 0.1, 0] },
            { at: 1, rotation: [0, 0, 0] },
          ],
        },
      ],
    },
    skill: {
      tracks: [
        {
          part: 'cannonMount',
          keyframes: [
            { at: 0, rotation: [0, 0, 0] },
            { at: 0.42, rotation: [-0.35, 0, 0] },
            { at: 0.56, rotation: [0.12, 0, 0] },
            { at: 1, rotation: [0, 0, 0] },
          ],
        },
        {
          part: 'cannon',
          keyframes: [
            { at: 0, position: [0, 0, 0] },
            { at: 0.5, position: [0, -0.16, 0] },
            { at: 0.58, position: [0, 0.42, 0] },
            { at: 1, position: [0, 0, 0] },
          ],
        },
        {
          part: 'pelvis',
          keyframes: [
            { at: 0, position: [0, 0, 0] },
            { at: 0.56, position: [0, -0.12, 0.18] },
            { at: 1, position: [0, 0, 0] },
          ],
        },
        {
          part: 'reactor',
          keyframes: [
            { at: 0, scale: [1, 1, 1] },
            { at: 0.5, scale: [1.8, 1.8, 1.8] },
            { at: 0.7, scale: [0.7, 0.7, 0.7] },
            { at: 1, scale: [1, 1, 1] },
          ],
        },
      ],
    },
  },
  anchors: { attack: 'fistL', skill: 'muzzle' },
  attack: f('melee', 'shards', 'box', 'sparks', 0.2, 0.05, 12, 7),
  skill: f('arc', 'shockwave', 'sphere', 'rings', 0.58, 2.2, 42, 12),
  portrait: { yaw: -0.42, pitch: 0.06, scale: 0.58 },
});
