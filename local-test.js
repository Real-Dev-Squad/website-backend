var fs = require('fs');

// import github credential
const githubCredentials = require('./config/local');

// check whether github credentials are not falsy
if (
  !githubCredentials.githubOauth ||
  !githubCredentials.githubOauth.clientId ||
  !githubCredentials.githubOauth.clientSecret
) {
  throw 'Github credentials are not properly set';
}

// throw an error if unable to read file
try {
  var firestoreData = fs.readFileSync('./firestore-private-key.json', 'utf8');
} catch (error) {
  console.log(error);
  throw 'Please make sure firestore-private-key.json file is correct';
}

// check whether firestoreData is empty, null, and  undefined
if (firestoreData === '' || firestoreData === null || firestoreData === undefined) {
  console.log(firestoreData);
  throw 'Please make sure firestore-private-key.json file is not empty';
}
