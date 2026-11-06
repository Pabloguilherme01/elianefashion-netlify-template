import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { join } from 'node:path';

const root = process.cwd();

function paymentHandler(stock = 3) {
  const captured = [];
  const admin = {
    firestore: () => ({
      collection: () => ({
        doc: (id) => ({
          get: async () => ({
            exists: true,
            data: () => ({ nome: 'Produto ' + id, preco: 100, estoque: stock }),
          }),
        }),
      }),
    }),
  };
  const env = { MP_ACCESS_TOKEN: 'MOCK-NO-TRANSACTION', URL_BASE: 'https://example.org' };
  const sandbox = {
    exports: {},
    process: { env },
    require: (id) => {
      if (id === './_firebase') return { getAdmin: () => admin };
      if (id === 'mercadopago') return {
        MercadoPagoConfig: class {},
        Preference: class {
          async create({ body }) { captured.push(body); return { id: 'mock-only' }; }
        },
      };
      throw new Error('Unexpected dependency: ' + id);
    },
  };
  const source = readFileSync(join(root, 'functions/create-payment.js'), 'utf8');
  runInNewContext(source, sandbox);
  return { handler: sandbox.exports.handler, captured };
}

test('repete o mesmo ID e soma quantidades antes de criar a preferência', async () => {
  const { handler, captured } = paymentHandler(3);
  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ items: [{ id: 'abc', quantidade: 1 }, { id: 'abc', quantidade: '2' }] }),
  });
  assert.equal(response.statusCode, 200);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].items.length, 1);
  assert.equal(captured[0].items[0].quantity, 3);
});

test('carrinho repetido não consegue ultrapassar estoque do Firestore', async () => {
  const { handler, captured } = paymentHandler(3);
  const response = await handler({
    httpMethod: 'POST',
    body: JSON.stringify({ items: [{ id: 'abc', quantidade: 2 }, { id: 'abc', quantidade: 2 }] }),
  });
  assert.equal(response.statusCode, 400);
  assert.equal(captured.length, 0);
});

test('rejeita JSON inválido e quantidade booleana antes de criar preferência', async () => {
  const { handler, captured } = paymentHandler(5);
  const broken = await handler({ httpMethod: 'POST', body: '{' });
  assert.equal(broken.statusCode, 400);
  const coerced = await handler({ httpMethod: 'POST', body: JSON.stringify({ items: [{ id: 'abc', quantidade: true }] }) });
  assert.equal(coerced.statusCode, 400);
  assert.equal(captured.length, 0);
});

test('o painel legado insere dados do Firestore somente como texto', async () => {
  const html = readFileSync(join(root, 'admin/index.html'), 'utf8');
  const inline = html.match(/<script>\s*([\s\S]*?)<\/script>/i)?.[1];
  assert.ok(inline, 'Inline admin script is available');
  const rows = [];
  const container = {
    replaceChildren() { rows.length = 0; },
    appendChild(node) { rows.push(node); },
    set innerHTML(_) { throw new Error('Untrusted HTML sink'); },
  };
  const unsafeName = '<img src=x onerror=alert(1)>';
  const db = {
    collection: () => ({
      get: async () => ({
        docs: [{ data: () => ({ nome: unsafeName, preco: 10 }) }],
      }),
    }),
  };
  const firebase = {
    initializeApp() {},
    auth: () => ({ signInWithPopup() {} }),
    firestore: () => db,
  };
  await runInNewContext(`(async () => { ${inline}; await carregarProdutos(); })()`, {
    firebase,
    document: {
      getElementById: () => container,
      createElement: (tag) => ({ tag, textContent: '' }),
    },
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].textContent, unsafeName + ' - R$ 10');
});
