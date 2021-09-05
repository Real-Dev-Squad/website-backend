/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const userModel = firestore.collection('users')
const { fetchWallet, createWallet } = require('../models/wallets')
const walletConstants = require('../constants/wallets')

/**
 * Fetches the data about our users
 * @return {Promise<userModel|Array>}
 */

const fetchUsers = async () => {
  try {
    const snapshot = await userModel.get()
    const queryArray = []
    snapshot.forEach((doc) => queryArray.push(doc))
    const allMembers = []

    if (!snapshot.empty) {
      await Promise.all(queryArray.map(async (doc) => {
        const memberData = doc.data()
        let memberWallet = await fetchWallet(memberData.id)
        if (!memberWallet) {
          memberWallet = await createWallet(memberData.id, walletConstants.INITIAL_WALLET)
          logger.info('Created new wallet for user')
        }
        const curatedMemberData = {
          id: doc.id,
          wallet: memberWallet,
          ...memberData,
          tokens: undefined,
          phone: undefined,
          email: undefined
        }
        curatedMemberData.isMember = !!(memberData.roles && memberData.roles.member)
        allMembers.push(curatedMemberData)
      }))
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
 * Fetches the data about our users with roles
 * @return {Promise<userModel|Array>}
 */

const fetchUsersWithRole = async (role) => {
  try {
    const snapshot = await userModel.where(`roles.${role}`, '==', true).get()
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
  fetchUsers,
  migrateUsers,
  deleteIsMemberProperty,
  fetchUsersWithRole
}
