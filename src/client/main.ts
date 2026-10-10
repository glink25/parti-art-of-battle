import './style.css';
import { GameApp } from './app';
const root = document.querySelector<HTMLElement>('#app')!;
interface Disposable {
  dispose(): void;
}
let app: Disposable;
const query = new URLSearchParams(location.search);
if (import.meta.env.DEV && query.has('vfx-battle')) {
  const { BattleEffectReview } = await import('./art/effects/battle-review');
  app = new BattleEffectReview(root);
} else if (import.meta.env.DEV && query.has('vfx-review')) {
  const { EffectReview } = await import('./art/effects/review');
  app = new EffectReview(root);
} else if (import.meta.env.DEV && query.has('art-review')) {
  const { ArtReviewSheet } = await import('./art/review-sheet');
  app = new ArtReviewSheet(root);
} else if (import.meta.env.DEV && query.get('art-playground') === '1') {
  const { ArtPlayground } = await import('./art/playground');
  app = new ArtPlayground(root);
} else {
  const game = new GameApp(root);
  app = game;
  void game.start();
}
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) app.dispose();
});
