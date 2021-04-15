const Firestore = require('../utils/firestore.js')
const config = require('config')

// check whether github credentials are not falsy
if (config.githubOauth.clientId === '<clientId>' ||
    config.githubOauth.clientSecret === '<clientSecret>') {
  throw new Error('Github credentials are not set.')
} else {
  // eslint-disable-next-line no-console
  console.log('Github credentials are properly set.')
}

let firestoreConfig
// throw an error if unable to read file
try {
  firestoreConfig = JSON.parse(config.firestore)
  // eslint-disable-next-line no-console
  console.log('firestore config is correct.')
} catch (error) {
  throw new Error('Please make sure firestore config exists as a String (not an object) and is correctly set up.')
}

// check whether firestoreConfig is empty, null, and  undefined
if (!firestoreConfig) {
  throw new Error('Please make sure firestore config is not empty')
} else {
  // eslint-disable-next-line no-console
  console.log('firestore config is not empty.')
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
  } else {
    // eslint-disable-next-line no-console
    console.log('Local development has permission to read and write in firestore.')
  }
  await docRef.delete()

  // eslint-disable-next-line no-console
  console.log('Success! The backend was successfully set up.')
})()
