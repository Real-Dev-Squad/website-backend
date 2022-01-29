const firestore = require('../utils/firestore')
const admin = require('firebase-admin')

const chaincodeModel = firestore.collection('chaincodes')
const storeChaincode = async (username) => {
  try {
    const userChaincode = await chaincodeModel.add({
      username,
      timestamp: admin.firestore.Timestamp.fromDate(new Date())
    })
    return userChaincode.id
  } catch (error) {
    logger.error('Error in creating chaincode', error)
    throw error
  }
}

module.exports = {
  storeChaincode
}
