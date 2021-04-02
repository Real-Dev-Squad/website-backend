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

    const allMembers = { oldMembers: [], newMembers: [] }

    snapshot.forEach((doc) => {
      const memberData = doc.data()
      const curatedMemberData = {
        id: doc.id,
        ...memberData,
        tokens: undefined,
        phone: undefined,
        email: undefined
      }
      switch (memberData.userType) {
        case 'new':
          allMembers.newMembers.push(curatedMemberData)
          break
        case 'blocked':
          // intentionally left blank for future use case
          break
        case 'member':
          // intentionally left break statement to fall through default case
          // so that doc with no userType field considered as members
          break
        default:
          allMembers.oldMembers.push(curatedMemberData)
          break
      }
    }
    )

    return allMembers
  } catch (err) {
    logger.error('Error retrieving members data', err)
    throw err
  }
}

/**
 * Checks whether the user is a superuser
 * @return {Boolean}
 */

const isSuperUser = (username) => {
  return username === 'ankush'
}

module.exports = {
  fetchMembers,
  isSuperUser
}
