/** Explicit uint32 streams; no wall clock or platform state. */
export function nextRandom(seed: number): number {
  let x = seed >>> 0 || 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}
export function hashText(text: string, initial = 2166136261): number {
  let hash = initial >>> 0;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}
export function deriveSeed(seed: number, key: string): number {
  return hashText(key, seed || 2166136261);
}
export function hashValue(value: unknown): string {
  return hashText(JSON.stringify(value)).toString(16).padStart(8, '0');
}
export function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
