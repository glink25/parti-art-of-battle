import * as THREE from 'three';
import { UNIT_BY_ID } from '../../content';
import type { GameResources } from '../resources';
import type { UnitArtDefinition, UnitModel } from './core/types';
import { EffectLibrary, modelAnchor, type EffectInstance } from './effects/runtime';
import { stableSeed, type EffectTiming } from './effects/types';

/** Preview is an adapter only: all surfaces, paths and sampling are the battle renderer. */
export class PreviewEffect {
  readonly group = new THREE.Group();
  private library = new EffectLibrary();
  private instance: EffectInstance;
  readonly timing: EffectTiming;
  constructor(
    _resources: GameResources,
    private art: UnitArtDefinition,
    private kind: 'attack' | 'skill',
  ) {
    this.instance = this.library.acquire(art[kind], art, stableSeed(`${art.id}:${kind}`));
    this.group.add(this.instance.group);
    const timing =
      kind === 'attack' ? UNIT_BY_ID[art.id].attackTiming : UNIT_BY_ID[art.id].skill.timing;
    const impact = timing.windupTicks + timing.travelTicks;
    this.timing = {
      start: 0,
      release: timing.windupTicks,
      impact,
      end: impact + Math.max(timing.recoveryTicks, art[kind].linger),
    };
  }
  sample(phase: number, model?: UnitModel): void {
    if (this.kind === 'attack' && UNIT_BY_ID[this.art.id].noAttack) {
      this.group.visible = false;
      return;
    }
    const from = model ? modelAnchor(model, this.kind) : new THREE.Vector3(0, 0.8, 0);
    const self =
      this.kind === 'skill' &&
      ['buff', 'shield', 'transform', 'summon'].includes(UNIT_BY_ID[this.art.id].skill.kind);
    const to = self ? new THREE.Vector3(0, 0.4, 0) : new THREE.Vector3(0, 0.3, -2.2);
    this.instance.sample(
      phase * this.timing.end,
      this.timing,
      from,
      to,
      this.kind === 'skill' && !self ? UNIT_BY_ID[this.art.id].skill.radius : 0.65,
    );
  }
  dispose(): void {
    this.library.dispose();
  }
}
