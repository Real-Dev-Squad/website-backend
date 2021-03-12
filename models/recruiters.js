/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore')
const recruiterModel = firestore.collection('recruiters')
const userModel = firestore.collection('users')

const addRecruiterInfo = async (req) => {
  try {
    const recruiterData = req.body
    const username = req.params.username
    const recruiterInfo = await recruiterModel.add(recruiterData)
    const recruiter = await recruiterModel.doc(recruiterInfo.id).get()
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
      timestamp: req._startTime
    }
  } catch (err) {
    logger.error('Error in adding recruiter', err)
    throw err
  }
}

module.exports = {
  addRecruiterInfo
}
