const firestore = require('../utils/firestore')
const minersModel = firestore.collection('miners')

const fetchMiners = async (size = 100, page = 0) => {
  try {
    const snapshot = await minersModel
      .limit(parseInt(size))
      .offset((parseInt(size)) * (parseInt(page)))
      .get()

    const allMiners = []
    snapshot.forEach(doc => {
      allMiners.push(doc.data())
    })

    return allMiners
  } catch (error) {
    logger.error('Error retrieving badges', error)
    return error
  }
}

module.exports = {
  fetchMiners
}
