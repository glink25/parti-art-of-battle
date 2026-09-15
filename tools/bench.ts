import { mkdirSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { CONTENT_HASH, RULES, UNITS } from '../src/content';
import type { BattleDescriptor } from '../src/domain/types';
import { LocalBattleExecutor } from '../src/combat/executor';
function descriptor(id: string, sideCount: number): BattleDescriptor {
  return {
    id,
    round: 30,
    seed: 12345,
    rulesetId: RULES.id,
    contentHash: CONTENT_HASH,
    simulationVersion: RULES.simulationVersion,
    teams: ['a', 'b'],
    mirror: false,
    neutral: false,
    sides: [0, 1].map((side) =>
      Array.from({ length: sideCount }, (_, i) => ({
        id: `${side}:${i}`,
        defId: UNITS[i % 20].id,
        ownerId: String(side),
        star: 3,
        x: i % 8,
        y: side ? 4 - Math.floor(i / 8) : 5 + Math.floor(i / 8),
        items: ['shield', 'blood', 'book'],
      })),
    ) as BattleDescriptor['sides'],
  };
}
const percentile = (a: number[], p: number) =>
  [...a].sort((a, b) => a - b)[Math.min(a.length - 1, Math.floor(a.length * p))];
const results = [];
for (const [label, battles, sideCount] of [
  ['four-32', 4, 16],
  ['eight-64-stress', 8, 32],
] as const) {
  const rounds: number[] = [],
    callbacks: number[] = [];
  for (let trial = 0; trial < 25; trial++) {
    const exec = new LocalBattleExecutor(
      Array.from({ length: battles }, (_, i) => descriptor(`bench-${i}`, sideCount)),
    );
    const start = performance.now();
    while (!exec.done) {
      const slice = performance.now();
      exec.advance(8);
      if (trial >= 5) callbacks.push(performance.now() - slice);
    }
    if (trial >= 5) rounds.push(performance.now() - start);
  }
  results.push({
    label,
    roundP50Ms: percentile(rounds, 0.5),
    roundP95Ms: percentile(rounds, 0.95),
    callbackP95Ms: percentile(callbacks, 0.95),
    callbackMaxMs: Math.max(...callbacks),
  });
}
const report = {
  runtime: process.version,
  platform: process.platform,
  cpu: cpus()[0].model,
  contentHash: CONTENT_HASH,
  scope:
    'Node CPU time only; excludes browser timers, transport and rendering. Mobile budgets require device measurement.',
  results,
};
mkdirSync('reports', { recursive: true });
writeFileSync('reports/benchmark.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
