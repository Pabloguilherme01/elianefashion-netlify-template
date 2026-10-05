const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET' }, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  const token = process.env.INSTAGRAM_TOKEN;
  if (!token) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Feed não configurado' }) };
  }

  try {
    const response = await axios.get('https://graph.instagram.com/me/media', {
      params: { fields: 'id,caption,media_url,permalink', access_token: token, limit: 12 },
      timeout: 5000
    });
    return { statusCode: 200, body: JSON.stringify(response.data.data || []) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Não foi possível carregar o feed' }) };
  }
};
