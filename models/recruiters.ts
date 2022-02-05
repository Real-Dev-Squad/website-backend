/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const recruiterModel = firestore.collection('recruiters')
const userModel = require('./users')

/**
 * Add the recruiter data
 *
 * @param recruiterData { Object }: Recruiter data object to be stored in DB
 * @param username { String }: Username String to be used to fetch the about user
 * @return {Promise<{message: string, id: string, recruiterName: string, userName: string, timestamp: string }>}
 */

const addRecruiterInfo = async (recruiterData, username) => {
  try {
    // Fetch the user from DB
    const { userExists, user: { first_name: userFirstName, last_name: userLastName, email: userEmail } } = await userModel.fetchUser({ username })
    if (!userExists) {
      return userExists
    }
    const userInfo = `${userFirstName} ${userLastName} (${userEmail})`
    recruiterData.timestamp = Date.now()
    // Add the recruiter data in DB
    const { id } = await recruiterModel.add(recruiterData)
    // Fetch the recruiter from DB
    const { first_name: firstName, last_name: lastName, timestamp } = (await recruiterModel.doc(id).get()).data()
    return {
      recruiterId: id,
      recruiterName: `${firstName} ${lastName}`,
      userInfo: userInfo,
      timestamp: timestamp
    }
  } catch (err) {
    logger.error('Error in adding recruiter', err)
    throw err
  }
}

module.exports = {
  addRecruiterInfo
}
