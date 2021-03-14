/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const logger = require('../utils/logger')
const firestore = require('../utils/firestore')
const cryptoUserModel = firestore.collection('users')

/**
* Get all user Information from crypto site
* @params {userId}
* @return {Promise<{cryptoUserModel|Object}>}
*/

const fetchUser = async (userId) => {
  try {
    let userInfo
    if (userId) {
      const user = await cryptoUserModel.where('user_id', '==', userId).get()
      user.forEach((doc) => {
        userInfo = doc.data()
      })
      return {
        ...userInfo
      }
    }
  } catch (error) {
    logger.error('Error while fetching the user', error)
    throw error
  }
  return ''
}

module.exports = {
  fetchUser
}
