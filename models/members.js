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

    const allMembers = []

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const memberData = doc.data()
        const curatedMemberData = {
          id: doc.id,
          ...memberData,
          tokens: undefined,
          phone: undefined,
          email: undefined
        }
        curatedMemberData.isMember = !!(memberData.roles && memberData.roles.member)
        allMembers.push(curatedMemberData)
      })
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
    const userSnapShot = await userModel.where('isMember', '==', true).get()
    const migratedUsers = []

    const usersArr = []

    userSnapShot.forEach(doc => usersArr.push({ id: doc.id, ...doc.data() }))

    for (const user of usersArr) {
      const roles = { ...user.roles, member: true }

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

/**
 * Deletes isMember property from user object
 * @return {Promise<usersMigrated|Object>}
 */
const deleteIsMemberProperty = async () => {
  try {
    const userSnapShot = await userModel.where('roles', '!=', false).get()
    const migratedUsers = []

    const usersArr = []

    userSnapShot.forEach(doc => usersArr.push({ id: doc.id, ...doc.data() }))

    for (const user of usersArr) {
      delete user.isMember

      await userModel.doc(user.id).set({ ...user })

      migratedUsers.push(user.username)
    }

    return { count: migratedUsers.length, users: migratedUsers }
  } catch (err) {
    logger.error('Error deleting isMember property', err)
    throw err
  }
}

/**
 * Fetches the data about our members with role member:true
 * @return {Promise<userModel|Array>}
 */

const fetchOnlyMembers = async () => {
  try {
    const snapshot = await userModel.where('roles.member', '==', true).get()
    const onlyMembers = []

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        onlyMembers.push({
          id: doc.id,
          ...doc.data(),
          phone: undefined,
          email: undefined,
          tokens: undefined
        })
      })
    }
    return onlyMembers
  } catch (err) {
    logger.error('Error retrieving members data with roles of member', err)
    throw err
  }
}

module.exports = {
  fetchMembers,
  migrateUsers,
  deleteIsMemberProperty,
  fetchOnlyMembers
}
