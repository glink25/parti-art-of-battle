import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
const allowed = {
  domain: ['domain'],
  content: ['domain', 'content'],
  rules: ['domain', 'content', 'rules'],
  combat: ['domain', 'content', 'combat'],
  bots: ['domain', 'content', 'rules', 'bots'],
  match: ['domain', 'content', 'rules', 'combat', 'bots', 'match'],
  parti: ['domain', 'content', 'rules', 'combat', 'bots', 'match', 'parti'],
  client: ['domain', 'content', 'combat', 'client'],
};
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)],
  );
}
const errors = [];
for (const file of files('src').filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'))) {
  const mod = file.split('/')[1],
    text = readFileSync(file, 'utf8');
  for (const [, spec] of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)) {
    if (spec.startsWith('.')) {
      const target = relative(resolve('src'), resolve(file, '..', spec)).split('/')[0];
      if (!allowed[mod]?.includes(target) && !file.includes('local-'))
        errors.push(`${file}: forbidden import ${spec}`);
    } else if (['domain', 'content', 'rules', 'combat', 'bots', 'match'].includes(mod))
      errors.push(`${file}: external dependency ${spec}`);
  }
  if (
    ['domain', 'content', 'rules', 'combat', 'bots', 'match'].includes(mod) &&
    /Math\.random\(|Date\.now\(|\bwindow\.|\bdocument\./.test(text)
  )
    errors.push(`${file}: nondeterministic/platform API`);
}
if (errors.length) throw new Error(errors.join('\n'));
console.log('Module boundaries valid');
