const { getAdmin, requireAdmin } = require('./_firebase');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    await requireAdmin(event);
    const body = JSON.parse(event.body || '{}');
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const quantity = Number(body.quantidade);
    if (!id || !Number.isInteger(quantity) || quantity < 1 || quantity > 1000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Dados inválidos' }) };
    }

    const admin = getAdmin();
    const db = admin.firestore();
    const ref = db.collection('produtos').doc(id);
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });
      const stock = Number(snapshot.data()?.estoque);
      if (!Number.isFinite(stock) || stock < quantity) throw Object.assign(new Error('INSUFFICIENT_STOCK'), { statusCode: 409 });
      transaction.update(ref, { estoque: admin.firestore.FieldValue.increment(-quantity) });
    });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    const statusCode = [401, 403, 404, 409].includes(error.statusCode) ? error.statusCode : 500;
    const messages = { 401: 'Não autorizado', 403: 'Acesso negado', 404: 'Produto não encontrado', 409: 'Estoque insuficiente' };
    return { statusCode, body: JSON.stringify({ error: messages[statusCode] || 'Não foi possível atualizar o estoque' }) };
  }
};
