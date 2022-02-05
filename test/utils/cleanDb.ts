// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetch'.
const { fetch } = require('../../utils/fetch')
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const firebaseConfig = require('../../firebase.json')

/**
 * Deletes all data from firestore emulator running locally.
 * To be used during tests for deleting the data as required.
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = async () => {
  const credentialsObject = JSON.parse(config.firestore)
  const projectId = credentialsObject.project_id

  const firestoreCleanUrl = `http://localhost:${firebaseConfig.emulators.firestore.port}` +
    `/emulator/v1/projects/${projectId}/databases/(default)/documents`

  return await fetch(firestoreCleanUrl, 'delete')
}
