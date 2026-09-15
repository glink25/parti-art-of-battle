import type { BattleDescriptor } from '../domain/types';
import { buildReplay } from '../combat/replay';
self.onmessage = (e: MessageEvent<BattleDescriptor>) => {
  try {
    self.postMessage({ ok: true, replay: buildReplay(e.data) });
  } catch (error) {
    self.postMessage({
      ok: false,
      id: e.data.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
