const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const config = require("config");

// Firestore config needs to contain the credentials as a string instead of JS object,
// because we will be setting it as an environment variable during deployment
const credentialsObject = JSON.parse(config.firestore);

admin.initializeApp({
  credential: admin.cert(credentialsObject),
});

const db = getFirestore();

module.exports = db;
