const firestore = require('../utils/firestore')
const logsModel = firestore.collection('logs')
const admin = require('firebase-admin')

const add = async (type, data) => {
  try {
    const log = {
      type,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      body: data
    }
    await logsModel.add(log)
  } catch (err) {
    logger.error('Error in adding log', err)
    throw err
  }
}

module.exports = {
  add
}
