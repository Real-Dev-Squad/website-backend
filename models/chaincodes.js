const firestore = require('../utils/firestore')
const admin = require('firebase-admin')

const chaincodeModel = firestore.collection('chaincodes')
const storeChaincode = async (username) => {
  try {
    const userchaincode = await chaincodeModel.add({
      username,
      timestamp: admin.firestore.Timestamp.fromDate(new Date())
    })
    return userchaincode.id
  } catch (error) {
    logger.error('Error in store in chaincode', error)
    throw error
  }
}

module.exports = {
  storeChaincode
}
