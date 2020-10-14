const Firestore = require('@google-cloud/firestore')

/**
 * Register FireStore DB
 * Link - https://cloud.google.com/firestore/docs/quickstart-servers#add_the_server_client_library_to_your_app
 */
const db = new Firestore({
  keyFilename: './firestore-private-key.json'
})

module.exports = db
