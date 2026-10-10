import * as THREE from 'three';
import { noise, TEXTURES } from './types';

/** Authored faceted silhouettes. No downloaded/generated raster assets or runtime network. */
export function createEffectAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 1024, 1024);
  type Point = [number, number];
  const polygon = (points: Point[], shade = 255) => {
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
  };
  const line = (points: Point[], width: number, shade = 255) => {
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = width;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
  };
  const arc = (radius: number, start: number, end: number, n = 14): Point[] =>
    Array.from({ length: n }, (_, i) => {
      const a = start + ((end - start) * i) / (n - 1);
      return [128 + Math.cos(a) * radius, 128 + Math.sin(a) * radius];
    });
  for (let cell = 0; cell < TEXTURES.length; cell++) {
    ctx.save();
    ctx.translate((cell % 4) * 256, Math.floor(cell / 4) * 256);
    ctx.beginPath();
    ctx.rect(12, 12, 232, 232);
    ctx.clip();
    const motif = TEXTURES[cell];
    if (motif === 'slash') {
      for (let j = 0; j < 3; j++)
        polygon(
          [
            ...arc(103 - j * 17, 2.1, 4.85),
            ...arc(76 - j * 14, 4.8, 2.25)
              .reverse()
              .reverse(),
          ],
          255 - j * 65,
        );
      line(arc(107, 2.25, 4.8), 3);
    } else if (motif === 'muzzle') {
      polygon(
        [
          [24, 128],
          [68, 110],
          [51, 73],
          [101, 108],
          [221, 126],
          [110, 146],
          [56, 189],
          [72, 146],
        ],
        155,
      );
      polygon(
        [
          [30, 128],
          [89, 116],
          [230, 128],
          [90, 137],
        ],
        255,
      );
    } else if (motif === 'fire' || motif === 'soul') {
      polygon(
        [
          [63, 223],
          [38, 173],
          [72, 131],
          [61, 88],
          [105, 116],
          [115, 24],
          [147, 79],
          [172, 99],
          [174, 49],
          [214, 148],
          [201, 200],
          [150, 231],
        ],
        100,
      );
      polygon(
        [
          [85, 222],
          [62, 171],
          [106, 129],
          [115, 62],
          [146, 120],
          [167, 91],
          [188, 161],
          [165, 214],
        ],
        185,
      );
      polygon(
        [
          [109, 215],
          [89, 179],
          [132, 127],
          [158, 176],
          [148, 214],
        ],
        255,
      );
    } else if (motif === 'smoke') {
      for (let j = 0; j < 9; j++) {
        const x = 68 + noise(21, j) * 120,
          y = 64 + noise(91, j) * 125,
          r = 30 + noise(37, j) * 26;
        const pts: Point[] = Array.from({ length: 7 }, (_, i) => [
          x + Math.cos((i * 6.283) / 7) * r,
          y + Math.sin((i * 6.283) / 7) * r,
        ]);
        polygon(pts, 35 + j * 9);
        polygon([pts[0], pts[1], [x, y], pts[6]], 65 + j * 10);
      }
    } else if (motif === 'water') {
      polygon(
        [
          [20, 220],
          [36, 148],
          [74, 81],
          [133, 40],
          [190, 53],
          [219, 88],
          [169, 73],
          [130, 95],
          [109, 145],
          [155, 186],
          [231, 212],
        ],
        100,
      );
      polygon(
        [
          [24, 212],
          [65, 149],
          [105, 87],
          [157, 60],
          [196, 72],
          [147, 82],
          [120, 127],
          [130, 162],
          [183, 205],
        ],
        185,
      );
      line(
        [
          [35, 144],
          [69, 91],
          [117, 57],
          [155, 48],
          [190, 59],
          [211, 85],
          [181, 77],
          [161, 86],
        ],
        10,
      );
      for (let j = 0; j < 12; j++) {
        const x = 30 + noise(4, j) * 185,
          y = 45 + noise(8, j) * 145;
        polygon(
          [
            [x, y],
            [x + 5, y - 8],
            [x + 9, y + 2],
          ],
          180,
        );
      }
    } else if (motif === 'lightning' || motif === 'crack' || motif === 'root') {
      const root = motif === 'root';
      for (let j = 0; j < 7; j++) {
        const a = (j * 6.283) / 7;
        const points: Point[] = [[128, 128]];
        for (let k = 1; k < 5; k++)
          points.push([
            128 + Math.cos(a) * k * 23 + (noise(j + 1, k) - 0.5) * 23,
            128 + Math.sin(a) * k * 23 + (noise(j + 30, k) - 0.5) * 23,
          ]);
        line(points, root ? 13 : motif === 'crack' ? 7 : 3, root ? 125 : 220);
        line(points, root ? 4 : 2, 255);
        const p = points[2];
        line(
          [
            p,
            [p[0] + Math.cos(a + 0.7) * 28, p[1] + Math.sin(a + 0.7) * 28],
            [p[0] + Math.cos(a + 0.5) * 52, p[1] + Math.sin(a + 0.5) * 52],
          ],
          root ? 5 : 2,
          160,
        );
      }
    } else if (motif === 'sigil' || motif === 'web') {
      for (let j = 0; j < 3; j++) line(arc(40 + j * 29, 0, Math.PI * 2, 9), j === 2 ? 4 : 2, 200);
      for (let j = 0; j < 8; j++) {
        const a = (j * Math.PI) / 4;
        line(
          [
            [128 + Math.cos(a) * 23, 128 + Math.sin(a) * 23],
            [128 + Math.cos(a) * 108, 128 + Math.sin(a) * 108],
          ],
          2,
          180,
        );
        if (motif === 'sigil') {
          ctx.save();
          ctx.translate(128, 128);
          ctx.rotate(a);
          polygon(
            [
              [69, -6],
              [79, -6],
              [86, 0],
              [79, 6],
              [69, 6],
              [74, 0],
            ],
            255,
          );
          ctx.restore();
        }
      }
    } else if (motif === 'bone') {
      for (let j = 0; j < 4; j++) {
        ctx.save();
        ctx.translate(55 + j * 47, 100 + (j % 2) * 50);
        ctx.rotate((j - 1.5) * 0.7);
        polygon(
          [
            [-11, -45],
            [-22, -51],
            [-28, -39],
            [-15, -23],
            [-9, 25],
            [-22, 38],
            [-17, 51],
            [0, 44],
            [17, 51],
            [22, 38],
            [9, 25],
            [15, -23],
            [28, -39],
            [22, -51],
            [11, -45],
          ],
          155,
        );
        polygon(
          [
            [-4, -37],
            [-2, 32],
            [8, 36],
            [5, -34],
          ],
          245,
        );
        ctx.restore();
      }
    } else if (motif === 'crystal') {
      for (let j = 0; j < 7; j++) {
        ctx.save();
        ctx.translate(50 + j * 25, 166 - noise(71, j) * 75);
        ctx.rotate((j - 3) * 0.22);
        polygon(
          [
            [-10, 39],
            [-17, -12],
            [0, -70],
            [16, -13],
            [10, 39],
          ],
          110,
        );
        polygon(
          [
            [0, -70],
            [0, 32],
            [10, 39],
            [16, -13],
          ],
          210,
        );
        polygon(
          [
            [0, -70],
            [-17, -12],
            [0, 0],
          ],
          255,
        );
        ctx.restore();
      }
    } else if (motif === 'feather' || motif === 'leaf') {
      line(
        [
          [44, 216],
          [180, 38],
        ],
        4,
        255,
      );
      for (let j = 0; j < 10; j++) {
        const x = 58 + j * 11,
          y = 198 - j * 14;
        polygon(
          [
            [x, y],
            [x - 36, y - 36],
            [x - 27, y - 58],
            [x + 9, y - 13],
          ],
          100 + j * 12,
        );
        polygon(
          [
            [x, y],
            [x + 45, y + 4],
            [x + 55, y - 17],
            [x + 9, y - 13],
          ],
          225 - j * 6,
        );
      }
    } else {
      polygon(
        [
          [25, 209],
          [52, 187],
          [71, 121],
          [92, 179],
          [117, 86],
          [141, 181],
          [177, 112],
          [187, 186],
          [229, 217],
        ],
        140,
      );
      polygon(
        [
          [42, 209],
          [84, 187],
          [117, 134],
          [139, 198],
          [185, 186],
          [215, 220],
        ],
        245,
      );
      for (let j = 0; j < 8; j++) {
        const x = 30 + j * 26,
          y = 70 + noise(81, j) * 65;
        polygon(
          [
            [x, y - 8],
            [x - 5, y + 4],
            [x + 5, y + 4],
          ],
          200,
        );
      }
    }
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = texture.magFilter = THREE.LinearFilter;
  return texture;
}
