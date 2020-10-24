/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const logger = require('../utils/logger')
const firestore = require('../utils/firestore')
const userModel = firestore.collection('users')

/**
 * Fetches the data about our members
 * @param query { Object }: Filter for members data
 * @return {Promise<userModel|Array>}
 */
const fetchMembers = async (query) => {
  try {
    const snapshot = await userModel.get()

    const allMembers = []

    snapshot.forEach((doc) => {
      if (doc.data().isMember) {
        allMembers.push({
          id: doc.id,
          ...doc.data(),
          tokens: undefined
        })
      }
    })

    return allMembers
  } catch (err) {
    logger.error('Error retrieving member data', err)
    throw err
  }
}

module.exports = {
  fetchMembers
}
