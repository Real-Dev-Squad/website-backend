/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const logger = require('../utils/logger')
const firestore = require('../utils/firestore')
const userModel = firestore.collection('users')

/**
 * Adds or updates the user data
 *
 * @param userData { Object }: User data object to be stored in DB
 * @return {Promise<{isNewUser: boolean, userId: string}|{isNewUser: boolean, userId: string}>}
 */
const addOrUpdate = async (userData) => {
  let userInfo

  try {
    // check if user already exists
    const user = await userModel.where('github_id', '==', userData.github_id).limit(1).get()
    if (!user.empty) {
      // user exists, update the existing user
      await userModel.doc(user.docs[0].id).set(userData, { merge: true })

      return { isNewUser: false, userId: user.docs[0].id }
    }

    // add user to the DB
    userInfo = await userModel.add(userData)

    return { isNewUser: true, userId: userInfo.id }
  } catch (err) {
    logger.error('Error in adding or updating user', err)
  }
}

/**
 * Fetches the user data from the passes userId
 *
 * @param userId { string }: Firestore primary key for the `users` collection
 * @return {Promise<{newUser: boolean, userId: string}|{newUser: boolean, userId: string}>}
 */
const fetchUser = async (userId) => {
  // @todo: Make this function generic to query any number of users depending on the params passed
  try {
    const user = await userModel.doc(userId).get()

    return user.data()
  } catch (err) {
    logger.error('Error retrieving user data', err)
  }
}

module.exports = {
  addOrUpdate,
  fetchUser
}
