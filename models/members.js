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
    const snapshot = await userModel.get()

    const allMembers = { oldMembers: [], newMembers: [] }

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        allMembers.push({
          id: doc.id,
          ...doc.data(),
          tokens: undefined,
          phone: undefined,
          email: undefined
        })
      })
    }

    return allMembers
  } catch (err) {
    logger.error('Error retrieving members data', err)
    throw err
  }
}

/**
 * Checks whether the user is a superuser
 * @return {Boolean}
 */

const isSuperUser = (username) => {
  return username === 'ankush'
}

module.exports = {
  fetchMembers,
  isSuperUser
}
