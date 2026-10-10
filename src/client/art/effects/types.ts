export const TEXTURES = [
  'slash',
  'muzzle',
  'fire',
  'smoke',
  'water',
  'lightning',
  'acid',
  'soul',
  'sigil',
  'crack',
  'root',
  'crystal',
  'feather',
  'bone',
  'leaf',
  'web',
] as const;
export type TextureMotif = (typeof TEXTURES)[number];
export type Choreography =
  | 'cut'
  | 'cleave'
  | 'thrust'
  | 'shot'
  | 'salvo'
  | 'shell'
  | 'breath'
  | 'wave'
  | 'storm'
  | 'roots'
  | 'ward'
  | 'quake'
  | 'sweep'
  | 'phase'
  | 'shadow'
  | 'snow'
  | 'lightning'
  | 'launch'
  | 'prism'
  | 'swallow'
  | 'seal'
  | 'bloom'
  | 'mend'
  | 'portal'
  | 'ascend'
  | 'web';
export interface EffectRecipe {
  signature: string;
  choreography: Choreography;
  texture: TextureMotif;
  secondary: TextureMotif;
  width: number;
  particles: number;
  /** Visual afterglow in ticks, never extra gameplay damage. */
  linger: number;
  arc: number;
  turns: number;
  spread: number;
}
export interface EffectTiming {
  start: number;
  release: number;
  impact: number;
  end: number;
}
export function phaseAt(time: number, timing: EffectTiming) {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  return {
    visible: time >= timing.start && time < timing.end,
    charge: clamp((time - timing.start) / Math.max(0.001, timing.release - timing.start)),
    flight: clamp((time - timing.release) / Math.max(0.001, timing.impact - timing.release)),
    hit: clamp((time - timing.impact) / Math.max(0.001, timing.end - timing.impact)),
    released: time >= timing.release,
    impacted: time >= timing.impact,
  };
}
export function stableSeed(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function noise(seed: number, index: number): number {
  let h = Math.imul(seed ^ Math.imul(index + 1, 374761393), 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Keys survive instance expiration; resending a release/impact cannot replay it. */
export class EventLedger {
  private keys = new Map<string, number>();
  accept(key: string, tick: number): boolean {
    if (this.keys.has(key)) return false;
    this.keys.set(key, tick);
    for (const [old, at] of this.keys) if (at < tick - 160) this.keys.delete(old);
    return true;
  }
  clear(): void {
    this.keys.clear();
  }
}
