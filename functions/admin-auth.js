const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

exports.handler = async (event) => {
  try {
    const token = event.headers.authorization?.split('Bearer ')[1];
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Não autorizado' }) };
    const decoded = await admin.auth().verifyIdToken(token);
    if (decoded.uid !== process.env.ADMIN_UID) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Acesso negado' }) };
    }
    return { statusCode: 200, body: JSON.stringify({ admin: true }) };
  } catch (error) {
    return { statusCode: 401, body: JSON.stringify({ error: error.message }) };
  }
};