import type { BattleDescriptor, BattleResult, BattleState } from '../domain/types';
import { createBattle, finishBattle, stepBattle } from './engine';
export interface BattleExecutor {
  advance(steps?: number): BattleResult[];
  readonly done: boolean;
}
export class LocalBattleExecutor implements BattleExecutor {
  private tasks: BattleState[];
  private cursor = 0;
  constructor(descriptors: BattleDescriptor[]) {
    this.tasks = descriptors.map(createBattle);
  }
  get done(): boolean {
    return this.tasks.length === 0;
  }
  advance(steps = 4): BattleResult[] {
    if (!this.tasks.length) return [];
    this.cursor %= this.tasks.length;
    const s = this.tasks[this.cursor];
    stepBattle(s, steps);
    if (s.done) {
      this.tasks.splice(this.cursor, 1);
      return [finishBattle(s)];
    }
    this.cursor = (this.cursor + 1) % this.tasks.length;
    return [];
  }
}
