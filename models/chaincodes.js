const firestore = require('../utils/firestore')
const admin = require('firebase-admin')

/**
*
* @param res {Object} - Express response object
*/

const chaincodeModel = firestore.collection('chaincodes')
const storeChaincode = async (username) => {
  try {
    const userchaincode = await chaincodeModel.add({
      username,
      timestamp: admin.firestore.Timestamp.fromDate(new Date())
    })
    return userchaincode.id
  } catch (error) {
    logger.error(`Error while storing chaincode: ${error}`)
    return res.boom.badImplementation('An internal server error occurred')
  }
}

module.exports = {
  storeChaincode
}
