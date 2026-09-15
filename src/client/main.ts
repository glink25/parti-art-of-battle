import './style.css';
import { GameApp } from './app';
const root = document.querySelector<HTMLElement>('#app')!;
const app = new GameApp(root);
void app.start();
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) app.dispose();
});
