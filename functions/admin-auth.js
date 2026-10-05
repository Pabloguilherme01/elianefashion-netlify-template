const { requireAdmin } = require('./_firebase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    await requireAdmin(event);
    return { statusCode: 200, body: JSON.stringify({ admin: true }) };
  } catch (error) {
    const statusCode = error.statusCode === 403 ? 403 : 401;
    return { statusCode, body: JSON.stringify({ error: statusCode === 403 ? 'Acesso negado' : 'Não autorizado' }) };
  }
};
