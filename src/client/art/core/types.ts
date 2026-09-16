import type * as THREE from 'three';

export type ArtPrimitive =
  | 'box'
  | 'capsule'
  | 'cone'
  | 'cylinder'
  | 'dodeca'
  | 'ico'
  | 'muscle'
  | 'octa'
  | 'roundedBox'
  | 'sphere'
  | 'torus'
  | 'wedge';

export type ArtColor = 'primary' | 'secondary' | 'accent' | 'dark' | 'ivory' | 'energy';

export interface ArtPart {
  name: string;
  primitive: ArtPrimitive;
  color: ArtColor;
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
  emissive?: boolean;
  /** Optional parent part. Transforms are local to this named part. */
  parent?: string;
  /** Authored XY silhouette extruded in Z, including true negative spaces. */
  profile?: {
    outline: [number, number][];
    holes?: [number, number][][];
    depth: number;
    bevel: number;
  };
  /** Tapered organic volume along a curved spine; x/y/z/radius control points. */
  sweep?: { points: [number, number, number, number][]; segments: number; sides: number };
  surface?: 'fur' | 'enamel' | 'steel' | 'brass' | 'stone' | 'glass' | 'wood' | 'cloth';
}

export interface ArtKeyframe {
  /** Normalized clip time in the inclusive range 0..1. */
  at: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface ArtAnimationTrack {
  part: string;
  keyframes: ArtKeyframe[];
}

export interface ArtAnimationClip {
  tracks: ArtAnimationTrack[];
}

export type MotionStyle =
  'brace' | 'breathe' | 'coil' | 'flutter' | 'hover' | 'prowl' | 'roll' | 'stalk' | 'tower';

export type StrikeStyle =
  | 'brace'
  | 'bite'
  | 'blast'
  | 'cast'
  | 'charge'
  | 'claw'
  | 'punch'
  | 'recoil'
  | 'slam'
  | 'slash'
  | 'thrust';

export type DeliveryStyle =
  'arc' | 'beam' | 'bolt' | 'breath' | 'dash' | 'melee' | 'orb' | 'rain' | 'summon' | 'wave';

export type ImpactStyle =
  | 'burst'
  | 'crystal'
  | 'flame'
  | 'flower'
  | 'hex'
  | 'lightning'
  | 'ripple'
  | 'shards'
  | 'shockwave'
  | 'vortex'
  | 'web';

export interface EffectArt {
  delivery: DeliveryStyle;
  impact: ImpactStyle;
  projectile: ArtPrimitive;
  trail: 'blocks' | 'embers' | 'needles' | 'none' | 'ribbon' | 'rings' | 'sparks';
  width: number;
  arc: number;
  particles: number;
  spin: number;
  hueShift: number;
}

export interface UnitArtDefinition {
  id: string;
  signature: string;
  palette: {
    primary: number;
    secondary: number;
    accent: number;
    dark: number;
    ivory: number;
    energy: number;
  };
  parts: ArtPart[];
  motion: {
    idle: MotionStyle;
    attack: StrikeStyle;
    skill: StrikeStyle;
    tempo: number;
    amplitude: number;
    recoil: number;
  };
  clips?: Partial<Record<'attack' | 'skill', ArtAnimationClip>>;
  anchors?: Partial<Record<'attack' | 'skill', string>>;
  attack: EffectArt;
  skill: EffectArt;
  portrait: { yaw: number; pitch: number; scale: number };
}

export interface UnitModel extends THREE.Group {
  userData: {
    art: UnitArtDefinition;
    baseParts: Map<
      string,
      { position: THREE.Vector3; rotation: THREE.Euler; scale: THREE.Vector3 }
    >;
    parts: Map<string, THREE.Object3D>;
    [key: string]: unknown;
  };
}
