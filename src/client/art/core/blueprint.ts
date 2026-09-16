import type { ArtColor, ArtPart, ArtPrimitive, EffectArt, UnitArtDefinition } from './types';

export const part = (
  name: string,
  primitive: ArtPrimitive,
  color: ArtColor,
  position: [number, number, number],
  scale: [number, number, number],
  rotation?: [number, number, number],
  emissive = false,
  parent?: string,
): ArtPart => ({ name, primitive, color, position, scale, rotation, emissive, parent });

export const fx = (
  delivery: EffectArt['delivery'],
  impact: EffectArt['impact'],
  projectile: EffectArt['projectile'],
  trail: EffectArt['trail'],
  width: number,
  arc: number,
  particles: number,
  spin: number,
  hueShift = 0,
): EffectArt => ({ delivery, impact, projectile, trail, width, arc, particles, spin, hueShift });

export function defineUnitArt(definition: UnitArtDefinition): UnitArtDefinition {
  return definition;
}

export function palette(
  primary: number,
  secondary: number,
  energy: number,
  accent = 0xffcf66,
): UnitArtDefinition['palette'] {
  return { primary, secondary, accent, dark: 0x17202b, ivory: 0xf2e8d2, energy };
}
