const firestore = require('../utils/firestore')
const admin = require('firebase-admin')

const chaincodeModel = firestore.collection('chaincodes')
const storeChaincode = async (username) => {
  const userchaincode = await chaincodeModel.add({
    username,
    timestamp: admin.firestore.Timestamp.fromDate(new Date())
  })
  return userchaincode.id
}

module.exports = {
  storeChaincode
}
