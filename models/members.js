/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const userModel = firestore.collection('users')

/**
 * Fetches the data about our members
 * @return {Promise<userModel|Array>}
 */

const fetchMembers = async () => {
  try {
    const snapshot = await userModel.where('isMember', '==', true).get()

    const allMembers = []

    snapshot.forEach((doc) => {
      allMembers.push({
        id: doc.id,
        ...doc.data(),
        tokens: undefined
      })
    }
    )

    return allMembers
  } catch (err) {
    logger.error('Error retrieving members data', err)
    throw err
  }
}

/**
 * Fetches the data about our member usernames
 * @return {Promise<userModel|Array>}
 */

const fetchMemberUsernames = async () => {
  try {
    const snapshot = await userModel.where('isMember', '==', true).get()

    const userNames = []

    snapshot.forEach((doc) => {
      userNames.push({
        username: doc.data().username
      })
    }
    )
    return userNames
  } catch (err) {
    logger.error('Error retrieving members data', err)
    throw err
  }
}

module.exports = {
  fetchMembers,
  fetchMemberUsernames
}
