import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'site-dist');

// Whitelist: never expose functions, lockfiles, admin demo or repository files
// through the Netlify static publishing directory.
const publicFiles = ['index.html', 'manifest.json', 'sw.js'];
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
for (const file of publicFiles) {
  copyFileSync(join(root, file), join(output, file));
}
console.info('Prepared static template files in site-dist (no backend source)');
