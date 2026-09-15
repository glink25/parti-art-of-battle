import { addPlayer, assertInvariants, createGame } from '../src/rules/game';
import {
  startMatch,
  freezeBattles,
  commitBattleResults,
  settleRound,
  beginRound,
} from '../src/match/lifecycle';
import { advanceBots } from '../src/bots/planner';
import { simulateBattle } from '../src/combat/engine';
export function runMatch(seed: number) {
  const s = createGame(seed);
  addPlayer(s, 'a', 'A', 'team-0', 0);
  addPlayer(s, 'b', 'B', 'team-0', 1);
  startMatch(s);
  let maxBytes = 0,
    commands = 0;
  while (s.phase !== 'finished') {
    let n = 0;
    while (advanceBots(s, true)) {
      if (++n > 384) throw new Error('Bot budget exceeded');
      assertInvariants(s);
    }
    commands += n;
    freezeBattles(s);
    commitBattleResults(s, s.battles.map(simulateBattle));
    maxBytes = Math.max(maxBytes, Buffer.byteLength(JSON.stringify(s)));
    settleRound(s);
    assertInvariants(s);
    if (s.phase === 'settlement') beginRound(s);
  }
  return {
    seed,
    rounds: s.round,
    winner: Object.values(s.teams).find((t) => t.rank === 1)!.id,
    maxBytes,
    commands,
    state: s,
  };
}
