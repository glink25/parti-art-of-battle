import { validateContent, CONTENT_HASH, UNITS, SYNERGIES, ITEMS } from '../src/content';
validateContent();
console.log(
  `Content ${CONTENT_HASH}: ${UNITS.length} units, ${SYNERGIES.length} synergies, ${ITEMS.length} items valid`,
);
