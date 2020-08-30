/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const logger = require('../utils/logger')
const firestore = require('../utils/firestore')
const userModel = firestore.collection('users')

/**
 * Adds the user data
 *
 * @param userData { Object }: User data object to be stored in DB
 * @return {Promise<{isNewUser: boolean, userId: string}|{isNewUser: boolean, userId: string}>}
 */
const addUser = async (userData) => {
  let userInfo

  try {
    // check if user already exists
    const user = await userModel.where('github_id', '==', userData.github_id).limit(1).get()

    if (!user.empty) {
      return { isNewUser: false }
    }

    // add user to the DB
    userInfo = await userModel.add(userData)

    return { isNewUser: true, userId: userInfo.id }
  } catch (err) {
    logger.error('Error in adding or updating user', err)
  }
}

/**
 * Updates the user data
 *
 * @param userData { Object }: User data object to be stored in DB
 * @return {Promise<{isNewUser: boolean, userId: string}|{isNewUser: boolean, userId: string}>}
 */
const updateUser = async (userId, userData) => {
  try {
    const user = await userModel.doc(userId).get()

    if (!user.exists) {
      return { userExists: false }
    }

    await userModel
      .doc(user.id)
      .set(
        userData,
        { merge: true }
      )

    return { userExists: true }
  } catch (err) {
    logger.error('Error in adding or updating user', err)
  }
}

/**
 * Fetches the data about our users
 * @param query { Object }: Filter for users data
 * @return {Promise<userModel|Array>}
 */
const fetchUsers = async (query) => {
  try {
    const snapshot = await userModel
      .limit(parseInt(query.size) || 100)
      .offset((parseInt(query.size) || 100) * (parseInt(query.page) || 0))
      .orderBy('id')
      .get()

    const allUsers = []

    snapshot.forEach((doc) => {
      allUsers.push({
        id: doc.id,
        ...doc.data()
      })
    })

    return allUsers
  } catch (err) {
    logger.error('Error retrieving user data', err)
  }
}

/**
 * Fetches the user data from the passes userId
 *
 * @param userId { string }: User id
 * @return {Promise<userModel|Object>}
 */
const fetchUser = async (userId) => {
  try {
    const user = await userModel.doc(userId).get()

    return user.data()
  } catch (err) {
    logger.error('Error retrieving user data', err)
  }
}

module.exports = {
  addUser,
  updateUser,
  fetchUsers,
  fetchUser
}
