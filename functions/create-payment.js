const mercadopago = require('mercadopago');
const { getAdmin } = require('./_firebase');

function parseItems(event) {
  const body = JSON.parse(event.body || '{}');
  if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
    throw new Error('INVALID_ITEMS');
  }
  return body.items.map((item) => {
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    const quantity = Number(item?.quantidade);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error('INVALID_ITEMS');
    }
    return { id, quantity };
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    if (!process.env.MP_ACCESS_TOKEN || !process.env.URL_BASE) throw new Error('SERVER_CONFIG');
    const requested = parseItems(event);
    const admin = getAdmin();
    const db = admin.firestore();

    const products = await Promise.all(requested.map(async ({ id, quantity }) => {
      const snapshot = await db.collection('produtos').doc(id).get();
      if (!snapshot.exists) throw new Error('PRODUCT_NOT_FOUND');
      const data = snapshot.data() || {};
      const price = Number(data.preco);
      const stock = Number(data.estoque);
      if (!data.nome || !Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < quantity) {
        throw new Error('PRODUCT_UNAVAILABLE');
      }
      return { title: String(data.nome).slice(0, 120), quantity, unit_price: price, currency_id: 'BRL' };
    }));

    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
    const response = await mercadopago.preferences.create({
      items: products,
      back_urls: {
        success: `${process.env.URL_BASE}/?success=true`,
        failure: `${process.env.URL_BASE}/?failure=true`
      },
      auto_return: 'approved'
    });

    return { statusCode: 200, body: JSON.stringify({ id: response.body.id }) };
  } catch (error) {
    const clientError = ['INVALID_ITEMS', 'PRODUCT_NOT_FOUND', 'PRODUCT_UNAVAILABLE'].includes(error.message);
    return {
      statusCode: clientError ? 400 : 500,
      body: JSON.stringify({ error: clientError ? 'Itens inválidos ou indisponíveis' : 'Não foi possível criar o pagamento' })
    };
  }
};
