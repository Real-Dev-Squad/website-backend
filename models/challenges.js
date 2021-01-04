/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const Firestore = require('@google-cloud/firestore')
const firestore = require('../utils/firestore')

const challengesModel = firestore.collection('challenges')
const userModel = firestore.collection('users')

const cannotSubscribe = 'User cannot be suscribed to challenge'
const userDoesNotExistError = 'User does not exist. Please register to participate'
const errorMessage = 'Error getting challenges'

/**
 * Fetch the challenges
 * @return {Promise<challengesModel|Array>}
 */

const fetchChallenges = async () => {
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
    logger.error(errorMessage, err)
    throw err
  }
}

/**
 * Post the challenge
 *  @return {Promise<challengesModel|Array>}
 */

const postChallenge = async (challengeData) => {
  try {
    const response = await challengesModel.add({
      ...challengeData,
      participants: [],
      is_active: true
    })
    const allChallenges = await fetchChallenges()
    if (response.id && allChallenges.length > 0) {
      return allChallenges
    } else return ''
  } catch (err) {
    logger.error(errorMessage, err)
    throw err
  }
}

/**
 * @param {String} userId
 * @param {String} challengeId
 * @return {Promise<challengesModel|Array>}
 */

const subscribeUserToChallenge = async (userId, challengeId) => {
  try {
    const getUser = await userModel.doc(userId).get()
    const user = getUser.data().github_display_name
    if (user) {
      const challengeRef = await challengesModel.doc(challengeId)
      await challengeRef.update({ participants: Firestore.FieldValue.arrayUnion({ name: user }) })
      return challengeRef.get()
    } else {
      throw new Error(userDoesNotExistError)
    }
  } catch (err) {
    logger.error(cannotSubscribe, err)
    throw err
  }
}

module.exports = {
  fetchChallenges,
  postChallenge,
  subscribeUserToChallenge
}
