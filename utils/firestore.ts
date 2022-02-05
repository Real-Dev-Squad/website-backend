// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const admin = require('firebase-admin')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('config')

// Firestore config needs to contain the credentials as a string instead of JS object,
// because we will be setting it as an environment variable during deployment
const credentialsObject = JSON.parse(config.firestore)

admin.initializeApp({
  credential: admin.credential.cert(credentialsObject)
})

const db = admin.firestore()

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = db
