const admin = require('firebase-admin');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: required('FIREBASE_PROJECT_ID'),
        clientEmail: required('FIREBASE_CLIENT_EMAIL'),
        privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n')
      })
    });
  }
  return admin;
}

async function requireAdmin(event) {
  const token = event.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    const error = new Error('Unauthorized');
    error.statusCode = 401;
    throw error;
  }
  const sdk = getAdmin();
  const decoded = await sdk.auth().verifyIdToken(token);
  if (!process.env.ADMIN_UID || decoded.uid !== process.env.ADMIN_UID) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
  return decoded;
}

module.exports = { getAdmin, requireAdmin };
