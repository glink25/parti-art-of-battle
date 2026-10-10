import * as THREE from 'three';

/** Authored faceted crystal and drone silhouettes, shared by instanced decorations. */
export function effectSculpture(kind: 'crystal' | 'drone'): THREE.BufferGeometry {
  const vertices: number[] = [];
  const triangle = (a: number[], b: number[], c: number[]) => vertices.push(...a, ...b, ...c);
  if (kind === 'crystal') {
    const base = Array.from({ length: 5 }, (_, i) => [
      Math.cos((i * Math.PI * 2) / 5) * 0.18,
      -0.2,
      Math.sin((i * Math.PI * 2) / 5) * 0.18,
    ]);
    const shoulder = base.map(([x, , z]) => [x * 0.85, 0.18, z * 0.85]);
    for (let i = 0; i < 5; i++) {
      const n = (i + 1) % 5;
      triangle(base[i], base[n], shoulder[i]);
      triangle(base[n], shoulder[n], shoulder[i]);
      triangle(shoulder[i], shoulder[n], [0.09, 0.7, -0.04]);
      triangle(base[n], base[i], [-0.03, -0.5, 0.02]);
    }
  } else {
    const p = [
      [0, 0.08, -0.7],
      [-0.16, 0.02, 0.45],
      [0.16, 0.02, 0.45],
      [0, 0.18, 0.1],
      [-0.85, -0.03, 0.42],
      [-0.13, 0.02, -0.25],
      [0.85, -0.03, 0.42],
      [0.13, 0.02, -0.25],
      [0, -0.09, 0.1],
    ];
    for (const [a, b, c] of [
      [0, 1, 3],
      [0, 3, 2],
      [1, 2, 3],
      [1, 4, 5],
      [2, 7, 6],
      [0, 8, 1],
      [0, 2, 8],
      [1, 8, 2],
    ])
      triangle(p[a], p[b], p[c]);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}
