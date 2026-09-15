import { mkdirSync, writeFileSync } from 'node:fs';
import { runMatch } from './simulation';
const count = Math.max(1, Math.min(100, Number(process.argv[2]) || 5)),
  start = performance.now(),
  rows = [];
for (let i = 0; i < count; i++) {
  const { state, ...row } = runMatch(1000 + i);
  rows.push(row);
  console.log(JSON.stringify(row));
}
const report = {
  runtime: process.version,
  platform: process.platform,
  seconds: (performance.now() - start) / 1000,
  matches: rows,
};
mkdirSync('reports', { recursive: true });
writeFileSync('reports/simulation.json', JSON.stringify(report, null, 2));
console.log(`Completed ${count} matches in ${report.seconds.toFixed(2)}s`);
