/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const userModel = firestore.collection('users')

/**
 * Adds or updates the user data
 *
 * @param userData { Object }: User data object to be stored in DB
 * @param userId { String }: User Id String to be used to update the user
 * @return {Promise<{isNewUser: boolean, userId: string}|{isNewUser: boolean, userId: string}>}
 */
const addOrUpdate = async (userData, userId = null) => {
  try {
    // userId exists Update user
    if (userId !== null) {
      const user = await userModel.doc(userId).get()
      const isNewUser = !(user.data())
      // user exists update user
      if (user.data()) {
        await userModel.doc(userId).set({
          ...user.data(),
          ...userData
        })
      }

      return { isNewUser, userId }
    }

    // userId is null, Add or Update user
    const user = await userModel.where('github_id', '==', userData.github_id).limit(1).get()
    if (!user.empty) {
      await userModel.doc(user.docs[0].id).set(userData, { merge: true })

      return { isNewUser: false, userId: user.docs[0].id }
    }

    // Add user
    userData.incompleteUserDetails = true
    const userInfo = await userModel.add(userData)
    return { isNewUser: true, userId: userInfo.id }
  } catch (err) {
    logger.error('Error in adding or updating user', err)
    throw err
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
      .get()

    const allUsers = []

    snapshot.forEach((doc) => {
      allUsers.push({
        id: doc.id,
        ...doc.data(),
        phone: undefined,
        email: undefined,
        tokens: undefined
      })
    })

    return allUsers
  } catch (err) {
    logger.error('Error retrieving user data', err)
    throw err
  }
}

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const fetchUser = async ({ userId = null, username = null }) => {
  try {
    let userData, id
    if (username) {
      const user = await userModel.where('username', '==', username).limit(1).get()

      user.forEach(doc => {
        id = doc.id
        userData = doc.data()
      })
    } else if (userId) {
      const user = await userModel.doc(userId).get()
      id = userId
      userData = user.data()
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
    throw err
  }
}

/**
 * Sets the incompleteUserDetails field of passed UserId to false
 *
 * @param userId { string }: User id
 */
const setIncompleteUserDetails = async (userId) => {
  const userRef = userModel.doc(userId)
  const doc = await userRef.get()
  if (doc.exists) {
    return userRef.update({
      incompleteUserDetails: false
    })
  }
  return {}
}

module.exports = {
  addOrUpdate,
  fetchUsers,
  fetchUser,
  setIncompleteUserDetails
}
