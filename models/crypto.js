/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const userModel = firestore.collection('Users')

/**
 * Fetches the data about our members
 * @return {Promise<userModel|Array>}
 */

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const fetchUser = async (name) => {
  try {
    let userData, id
    if (name) {
      const user = await userModel.where('name', '==', name).get()

      user.forEach(doc => {
        id = doc.id
        userData = doc.data()
      })
    }
    return {
      userExists: !!userData,
      user: {
        id,
        ...userData,
        tokens: undefined
      }
    }
  } catch (err) {
    logger.error('Error retrieving user data', err)
    return err
  }
}
module.exports = {
  fetchUser
}