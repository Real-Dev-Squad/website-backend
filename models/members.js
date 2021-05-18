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
 * changes the role of a new user to member
 * @param userId { String }: User id of user to be modified
 * @return existingMember { Boolean }: to show if user is already a member
 */

const moveToMembers = async (userId) => {
  try {
    const userDoc = await userModel.doc(userId).get()
    const user = userDoc.data()
    if (user.roles && user.roles.member) {
      return true
    }
    const roles = user.roles ? { ...user.roles, member: true } : { member: true }
    await userModel.doc(userId).update({
      roles
    })
    return false
  } catch (err) {
    logger.error('Error updating user', err)
    throw err
  }
}

module.exports = {
  fetchMembers,
  moveToMembers
}
