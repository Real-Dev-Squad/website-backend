const logger = require('../../utils/logger')
const firestore = require('../../utils/firestore')



const challengesModel = firestore.collection('/challenges')

const errorMessages = 'error getting challenges'

async function fetchChallenges () {
  try {
    const challengesSnapshot = await challengesModel.get()
    return (function () {
      const challenges = []
      challengesSnapshot.forEach((challengeDoc) => {
        challenges.push({
          id: challengeDoc.id,
          ...challengeDoc.data()
        })
      })
      return challenges
    })()
  } catch (err) {
    logger.error(errorMessages, err)
    throw err
  }
}

async function postChallenge (challengeData) {
  try {
    const response = await challengesModel.add({
      ...challengeData,
      participants:[],
      is_active:true

    })
    const allChallenges = await fetchChallenges()
    if (response.id && allChallenges.length > 0) {
      return allChallenges
    } else return ''
  } catch (err) {
    logger.error(errorMessages, err)
    throw err
  }
}

module.exports = {
  fetchChallenges,
  postChallenge
}
