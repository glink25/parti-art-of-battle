const paths: Record<string, string> = {
  coin: '<circle cx="12" cy="12" r="8"/><path d="m12 7 4 5-4 5-4-5z"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="M12 7v10M8 12h8"/>',
  sword: '<path d="m5 20 8-8M3 16l5 5M10 10 18 2l4 1-1 4-8 8z"/>',
  refresh: '<path d="M20 10A8 8 0 0 0 5 6L2 9m0-6v6h6M4 14a8 8 0 0 0 15 4l3-3m0 6v-6h-6"/>',
  xp: '<path d="m5 14 7-7 7 7M5 20l7-7 7 7M12 3v4"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
  shop: '<path d="M3 9h18l-2-6H5zM5 9v12h14V9M9 21v-7h6v7"/>',
  bag: '<path d="M5 7h14l2 14H3zM8 8V6a4 4 0 0 1 8 0v2"/>',
  flag: '<path d="M5 22V3l14 2-3 5 3 5-14-2"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  swap: '<path d="M3 7h17l-4-4m4 4-4 4M21 17H4l4-4m-4 4 4 4"/>',
  sell: '<path d="M8 7h13l-2 13H7L4 3H1M8 11h11M9 15h9"/>',
  heart: '<path d="M12 21S1 14 2 7c1-6 8-5 10 0 2-5 9-6 10 0 1 7-10 14-10 14z"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  gear: '<path d="m9 3 6 0 1 4 4 2v6l-4 2-1 4H9l-1-4-4-2V9l4-2z"/><circle cx="12" cy="12" r="3"/>',
  target:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',
  magic: '<path d="m12 2 4 7 6 3-6 3-4 7-4-7-6-3 6-3z"/><path d="m12 7 3 5-3 5-3-5z"/>',
  beast: '<path d="m4 3 5 4h6l5-4-1 12-7 7-7-7zM7 11l2 2m8-2-2 2m-5 4h4"/>',
  blast: '<path d="m10 2 4 6 7-3-3 7 4 5-8-1-4 6-2-7-7-3 7-3z"/>',
  back: '<path d="m10 4-8 8 8 8M2 12h20"/>',
  check: '<path d="m4 12 5 6L21 5"/>',
};
export function icon(name: string): string {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths[name] ?? paths.magic}</svg>`;
}
export const tagIcon: Record<string, string> = {
  infantry: 'sword',
  beast: 'beast',
  armor: 'shield',
  psionic: 'magic',
  guard: 'shield',
  sniper: 'target',
  blast: 'blast',
  support: 'heart',
};
export const itemIcon: Record<string, string> = {
  blade: 'sword',
  shield: 'shield',
  blood: 'heart',
  clock: 'refresh',
  book: 'magic',
  capsule: 'bag',
};
