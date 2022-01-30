const admin = require('firebase-admin');
const config = require('config');

// Firestore config needs to contain the credentials as a string instead of JS object,
// because we will be setting it as an environment variable during deployment
const credentialsObject = JSON.parse(config.firestore);

admin.initializeApp({
  credential: admin.credential.cert(credentialsObject),
});

const db = admin.firestore();

module.exports = db;
