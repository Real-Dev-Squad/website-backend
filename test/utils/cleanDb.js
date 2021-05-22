const config = require('config')
const { fetch } = require('../../utils/fetch')
const firebaseConfig = require('../../firebase.json')

/**
 * Deletes all data from firestore emulator running locally.
 * To be used during tests for deleting the data as required.
 */
module.exports = async () => {
  const credentialsObject = JSON.parse(config.firestore)
  const projectId = credentialsObject.project_id

  const firestoreCleanUrl = `http://localhost:${firebaseConfig.emulators.firestore.port}` +
    `/emulator/v1/projects/${projectId}/databases/(default)/documents`

  return await fetch(firestoreCleanUrl, 'delete')
}
