import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

test('template layout uses deployable filenames', () => {
  for (const path of [
    'index.html',
    'admin/index.html',
    'netlify.toml',
    'sw.js',
    'functions/admin-auth.js',
    'functions/create-payment.js',
    'functions/instagram-feed.js',
    'functions/update-stock.js',
  ]) {
    assert.equal(existsSync(join(root, path)), true, path);
  }
  for (const obsolete of ['index.html.html', 'netlify.toml.txt', 'sw.js.js', 'elianefashion-netlify-template-main.zip']) {
    assert.equal(existsSync(join(root, obsolete)), false, obsolete);
  }
});

test('serverless functions are syntactically valid CommonJS', () => {
  for (const file of ['_firebase.js', 'admin-auth.js', 'create-payment.js', 'instagram-feed.js', 'update-stock.js']) {
    const source = readFileSync(join(root, 'functions', file), 'utf8');
    assert.doesNotThrow(() => new Function('require', 'exports', 'module', source), file);
  }
});
