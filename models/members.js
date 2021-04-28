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

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        allMembers.push({
          id: doc.id,
          ...doc.data(),
          tokens: undefined,
          phone: undefined,
          email: undefined
        })
      }
      )
    }

    return allMembers
  } catch (err) {
    logger.error('Error retrieving members data', err)
    throw err
  }
}

/**
 * Migrate user roles
 * @return {Promise<usersMigrated|Object>}
 */
const migrateUsers = async () => {
  try {
    const userSnapShot = await userModel.get()
    const migratedUsers = []

    const usersArr = []

    userSnapShot.forEach(doc => usersArr.push({ id: doc.id, ...doc.data() }))

    for (const user of usersArr) {
      const roles = { member: true }

      if (!user.isMember) roles.member = false
      delete user.isMember

      await userModel.doc(user.id).set({
        ...user,
        roles
      })

      migratedUsers.push(user.username)
    }

    return { count: migratedUsers.length, users: migratedUsers }
  } catch (err) {
    logger.error('Error migrating user roles', err)
    throw err
  }
}
module.exports = {
  fetchMembers,
  migrateUsers
}
