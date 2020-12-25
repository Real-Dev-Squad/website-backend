const fs = require('fs')
const Firestore = require('./utils/firestore.js')
const config = require('config')
const logger = require('./utils/logger')

// check whether github credentials are not falsy
if (
  !config.githubOauth ||
  !config.githubOauth.clientId ||
  !config.githubOauth.clientSecret
) {
  throw new Error('Github credentials are not properly set')
}

// throw an error if unable to read file
try {
  var firestoreData = fs.readFileSync('./firestore-private-key.json', 'utf8')
} catch (error) {
  throw new Error('Please make sure firestore-private-key.json file is correct')
}

// check whether firestoreData is empty, null, and  undefined
if (!firestoreData) {
  throw new Error('Please make sure firestore-private-key.json file is not empty')
}

// check local development have permission to read and write in firestore or not
(async () => {
  const docRef = await Firestore.collection('dummy').doc('users')
  await docRef.set({
    user: 'dummy'
  })
  const resp = await docRef.get('user')
  if (resp.data().user !== 'dummy') {
    throw new Error('Problem with permission of read and write.\nCheck your firestore permissions')
  }
  await docRef.delete()
})()

logger.info('SUCCESS!!! backend setup successful')
