const Firestore = require('@google-cloud/firestore')
const config = require('config')

/**
 * Register FireStore DB
 * Link - https://cloud.google.com/firestore/docs/quickstart-servers#add_the_server_client_library_to_your_app
 */
const db = new Firestore({
  projectId: config.get('databases.fireStore.projectId'),
  keyFilename: './firestore-private-key.json'
})

module.exports = db
