/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'recruiterM... Remove this comment to see the full error message
const recruiterModel = firestore.collection('recruiters')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = require('./users')

/**
 * Add the recruiter data
 *
 * @param recruiterData { Object }: Recruiter data object to be stored in DB
 * @param username { String }: Username String to be used to fetch the about user
 * @return {Promise<{message: string, id: string, recruiterName: string, userName: string, timestamp: string }>}
 */

const addRecruiterInfo = async (recruiterData: any, username: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  addRecruiterInfo
}
