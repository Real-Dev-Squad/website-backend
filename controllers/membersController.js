const getFirestoreDB = require('../utils/firestore')

/**
 * Fetches the data about our members
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */

async function getMembers (req, res) {
  const db = getFirestoreDB()

  const snapshot = await db.collection('members').get()

  const allMembers = []

  snapshot.forEach((doc) => {
    allMembers.push({
      id: doc.id,
      ...doc.data()
    })
  })

  res.json(allMembers)
}

async function addNewMember (memberData) {
  const memberId = 'test'
  const db = getFirestoreDB()
  const memberRef = db.collection('members').doc(memberId)
  const doc = await memberRef.get()

  if (!doc.exists) {
    await memberRef.set({
      first: 'First Name',
      last: 'Last Name',
      born: Math.random()
    })
  }
}

module.exports = {
  getMembers,
  addNewMember
}
