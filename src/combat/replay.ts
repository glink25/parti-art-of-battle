import type {
  BattleDescriptor,
  BattleEvent,
  BattleResult,
  BattleState,
  CombatAction,
} from '../domain/types';
import { createBattle, finishBattle, stepBattle } from './engine';
export interface ReplayUnit {
  id: string;
  defId: string;
  side: number;
  star: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shield: number;
  layer: string;
  stunUntil: number;
  poisonUntil: number;
  buffUntil: number;
  silencedUntil?: number;
  tauntedUntil?: number;
  itemsDisabledUntil?: number;
  immunityUntil?: number;
  armorDebuff?: number;
  extremeTriggered?: boolean;
  deathAt: number | null;
  action: CombatAction | null;
}
export interface ReplayAction {
  sourceId: string;
  defId: string;
  side: number;
  x: number;
  y: number;
  action: CombatAction;
}
export interface ReplayDeathBurst {
  sourceId: string;
  defId: string;
  side: number;
  x: number;
  y: number;
  impactAt: number;
}
export interface ReplayFrame {
  battleId: string;
  tick: number;
  units: ReplayUnit[];
  actions: ReplayAction[];
  deathBursts: ReplayDeathBurst[];
  events: BattleEvent[];
}
export interface BattleReplay {
  id: string;
  frames: ReplayFrame[];
  result: BattleResult;
}
export function frame(s: BattleState, events: BattleEvent[] = []): ReplayFrame {
  return {
    battleId: s.descriptor.id,
    tick: s.tick,
    units: s.entities
      .filter((e) => e.hp > 0)
      .map(
        ({
          id,
          defId,
          side,
          star,
          x,
          y,
          hp,
          maxHp,
          shield,
          layer,
          stunUntil,
          poisonUntil,
          buffUntil,
          silencedUntil,
          tauntedUntil,
          itemsDisabledUntil,
          immunityUntil,
          armorDebuff,
          extremeTriggered,
          deathAt,
          action,
        }) => ({
          id,
          defId,
          side,
          star,
          x,
          y,
          hp,
          maxHp,
          shield,
          layer,
          stunUntil,
          poisonUntil,
          buffUntil,
          silencedUntil,
          tauntedUntil,
          itemsDisabledUntil,
          immunityUntil,
          armorDebuff,
          extremeTriggered,
          deathAt,
          action: action ? { ...action } : null,
        }),
      ),
    actions: s.entities
      .filter((e) => e.action && (e.hp > 0 || e.action.released))
      .map((e) => ({
        sourceId: e.id,
        defId: e.defId,
        side: e.side,
        x: e.x,
        y: e.y,
        action: { ...e.action! },
      })),
    deathBursts: s.entities
      .filter((e) => e.deathBurstAt !== null && e.deathBurstAt > s.tick)
      .map((e) => ({
        sourceId: e.id,
        defId: e.defId,
        side: e.side,
        x: e.x,
        y: e.y,
        impactAt: e.deathBurstAt!,
      })),
    events,
  };
}
export function buildReplay(d: BattleDescriptor): BattleReplay {
  const s = createBattle(d),
    frames = [frame(s)];
  while (!s.done) {
    const events = stepBattle(s, 4);
    frames.push(frame(s, events));
  }
  return { id: d.id, frames, result: finishBattle(s) };
}
