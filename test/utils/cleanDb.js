const config = require('config')
const { fetch } = require('../../utils/fetch')
const firebaseConfig = require('../../firebase.json')

/**
 * Deletes all data from firestore emulator running locally.
 * To be used during tests for deleting the data as required.
 */
module.exports = async () => {
  const firestoreCleanUrl = `http://localhost:${firebaseConfig.emulators.firestore.port}` +
    `/emulator/v1/projects/${config.get('db.firestore.projectId')}/databases/(default)/documents`

  return await fetch(firestoreCleanUrl, 'delete')
}
