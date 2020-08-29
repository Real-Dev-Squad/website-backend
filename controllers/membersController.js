const db = require('../utils/firestore')
const logger = require('../utils/logger')

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */

async function getMembers (req, res) {
  try {
    const snapshot = await db.collection('members').get()

    const allMembers = []

    snapshot.forEach((doc) => {
      allMembers.push({
        id: doc.id,
        ...doc.data()
      })
    })

    if (allMembers.length) {
      res.json({
        message: 'Members returned successfully!',
        members: allMembers
      })
    }

    res.status(404).json({
      error: 'Not Found',
      message: 'No members available'
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Something went wrong please contact admin'
    })
  }
}

/**
 * Fetches the data about member with given id
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */

async function getMember (req, res) {
  try {
    const doc = await db.collection('members').doc(req.params.id).get()

    if (doc.exists) {
      res.json({
        message: 'Member returned successfully!',
        member: doc.data()
      })
    }

    res.status(404).json({
      error: 'Not Found',
      message: "Member doesn't exist"
    })
  } catch (error) {
    logger.error(`Error while fetching all members: ${error}`)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Something went wrong please contact admin'
    })
  }
}

/**
 * Add new member
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - Member object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
async function addNewMember (req, res) {
  try {
    const memberRef = db.collection('members').doc(req.body.id)
    const doc = await memberRef.get()

    if (!doc.exists) {
      await memberRef.set(req.body)
      res.json({
        message: 'Member added successfully!'
      })
    }

    res.status(400).json({
      error: 'Bad Request',
      message: 'Member already exists'
    })
  } catch (error) {
    logger.error(`Error while creting new member: ${error}`)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Something went wrong please contact admin'
    })
  }
}

module.exports = {
  getMembers,
  getMember,
  addNewMember
}
