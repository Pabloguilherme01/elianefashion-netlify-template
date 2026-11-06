import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('Netlify só publica os arquivos estáticos permitidos', () => {
  const root = process.cwd();
  const build = spawnSync(process.execPath, ['scripts/build-static.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(build.status, 0, build.stderr);
  const out = join(root, 'site-dist');
  try {
    assert.deepEqual(readdirSync(out).sort(), ['index.html', 'manifest.json', 'sw.js']);
    for (const filename of ['index.html', 'manifest.json', 'sw.js']) {
      assert.equal(readFileSync(join(out, filename), 'utf8'), readFileSync(join(root, filename), 'utf8'));
    }
    for (const secretSource of ['package-lock.json', 'netlify.toml', 'functions', 'admin', 'scripts', 'README.md']) {
      assert.equal(existsSync(join(out, secretSource)), false, secretSource);
    }
    const config = readFileSync(join(root, 'netlify.toml'), 'utf8');
    assert.match(config, /publish\s*=\s*"site-dist"/);
    assert.match(config, /functions\s*=\s*"functions"/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
