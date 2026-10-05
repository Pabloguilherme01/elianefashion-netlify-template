const mercadopago = require('mercadopago');

exports.handler = async (event) => {
  try {
    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });
    const { items } = JSON.parse(event.body);
    const preference = {
      items: items.map(item => ({
        title: item.nome,
        quantity: item.quantidade,
        unit_price: item.preco,
        currency_id: 'BRL'
      })),
      back_urls: {
        success: `${process.env.URL_BASE}/?success=true`,
        failure: `${process.env.URL_BASE}/?failure=true`
      },
      auto_return: 'approved'
    };
    const response = await mercadopago.preferences.create(preference);
    return { statusCode: 200, body: JSON.stringify({ id: response.body.id }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};