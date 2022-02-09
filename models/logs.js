const firestore = require('../utils/firestore')
const logsModel = firestore.collection('logs')
const admin = require('firebase-admin')

const add = async (type, data) => {
  try {
    const log = {
      type,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      body: data
    }
    await logsModel.add(log)
  } catch (err) {
    logger.error('Error in adding log', err)
    throw err
  }
}

const addProfileLog = async (userResult, profileResult, username) => {
  try {
    const returnData = (arg) => arg || ''
    const profileObject = (data) => {
      return {
        first_name: returnData(data.first_name),
        last_name: returnData(data.last_name),
        email: returnData(data.email),
        phone: returnData(data.phone),
        yoe: returnData(data.yoe),
        company: returnData(data.company),
        designation: returnData(data.designation),
        github_id: returnData(data.github_id),
        linkedin_id: returnData(data.linkedin_id),
        twitter_id: returnData(data.twitter_id),
        instagram_id: returnData(data.instagram_id),
        website: returnData(data.website)
      }
    }
    const oldProfile = profileObject(userResult)
    const newProfile = profileObject(profileResult)
    const logBody = `username=${username} oldData=${JSON.stringify(oldProfile)} newData=${JSON.stringify(newProfile)}`

    await add('profileChange', logBody)
  } catch (err) {
    logger.error('Error in creating profile change log', err)
    throw err
  }
}

module.exports = {
  add,
  addProfileLog
}
