const firestore = require('../utils/firestore')
const logsModel = firestore.collection('logs')

const fetchLog = async (query) => {
  try {
    const username = query.username
    const type = query.type
    const timestamp = query.timestamp
    const payload = query.payload

    const usersArray = []

    if (username) {
      const users = await logsModel.where('type', '==', type).get()
      users.forEach((doc) => {
        usersArray.push({
          ...doc.data()
        })
      })
    }
    const filteredLogs = usersArray.filter(x =>
      x.type === type &&
       x.timestamp === timestamp &&
       x.ayload === payload)

      return filteredLogs
  } catch (err) {
    logger.error('Error retrieving user data', err)
    throw err
  }
}

module.exports = {
  fetchLog
}
