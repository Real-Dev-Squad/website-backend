/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const recruiterModel = firestore.collection('recruiters')
const userModel = firestore.collection('users')

/**
 * Add the recruiter data
 *
 * @param recruiterData { Object }: Recruiter data object to be stored in DB
 * @param username { String }: Username String to be used to fetch the about user
 * @return {Promise<{message: string, id: string, recruiterName: string, userName: string, timestamp: string }>}
 */

const addRecruiterInfo = async (recruiterData, username) => {
  try {
    // Add the recruiter data in DB
    const recruiterInfo = await recruiterModel.add(recruiterData)
    // Fetch the recruiter from DB
    const recruiter = await recruiterModel.doc(recruiterInfo.id).get()
    // Fetch the user from DB
    const user = await userModel.where('username', '==', username).limit(1).get()
    let userName
    if (!user.empty) {
      user.forEach(doc => {
        const userFirstName = doc.data().first_name
        const userLastName = doc.data().last_name
        const userEmail = doc.data().email
        userName = userFirstName + ' ' + userLastName + ' (' + userEmail + ')'
      })
    }
    return {
      message: 'Request Submission Successful!!',
      id: recruiterInfo.id,
      recruiterName: recruiter.data().firstName + ' ' + recruiter.data().lastName,
      userName: userName,
      timestamp: new Date().toUTCString()
    }
  } catch (err) {
    logger.error('Error in adding recruiter', err)
    throw err
  }
}

module.exports = {
  addRecruiterInfo
}
