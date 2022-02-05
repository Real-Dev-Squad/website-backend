/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Firestore'... Remove this comment to see the full error message
const Firestore = require('@google-cloud/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUser'... Remove this comment to see the full error message
const { fetchUser } = require('./users')

const challengesModel = firestore.collection('challenges')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = firestore.collection('users')

const CANNOT_SUBSCRIBE = 'User cannot be subscribed to challenge'
const USER_DOES_NOT_EXIST_ERROR = 'User does not exist. Please register to participate'
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ERROR_MESS... Remove this comment to see the full error message
const ERROR_MESSAGE = 'Error getting challenges'

/**
 * Fetch the challenges
 * @return {Promise<challengesModel|Array>}
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchChall... Remove this comment to see the full error message
const fetchChallenges = async () => {
  try {
    const challengesSnapshot = await challengesModel.get()
    const challenges: any = []
    challengesSnapshot.forEach((challengeDoc: any) => {
      challenges.push({
        id: challengeDoc.id,
        ...challengeDoc.data()
      })
    })
    return challenges
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

/**
 * Fetch the <user object> from participants array
 * @param {Array} participants
 * @returns {Promise<challengesModel|Array>}
 */
const fetchParticipantsData = async (participants: any) => {
  try {
    const promises = participants.map(async (userId: any) => {
      const { user } = await fetchUser({ userId })
      return {
        ...user,
        phone: undefined,
        email: undefined
      }
    })
    const fetchedparticipants = await Promise.all(promises)
    return fetchedparticipants
  } catch (err) {
    logger.error('Failed to get participated users', err)
    throw err
  }
}

/**
 * Post the challenge
 *  @return {Promise<challengesModel|Array>}
 */

const postChallenge = async (challengeData: any) => {
  try {
    const { start_date: startDate, end_date: endDate } = challengeData
    const startdate = new Firestore.Timestamp(startDate, 0)
    const enddate = new Firestore.Timestamp(endDate, 0)
    const challengeRef = await challengesModel.add({
      ...challengeData,
      start_date: startdate,
      end_date: enddate,
      participants: [],
      is_active: true
    })
    return challengeRef.id
  } catch (err) {
    logger.error(ERROR_MESSAGE, err)
    throw err
  }
}

/**
 * @param {String} userId
 * @param {String} challengeId
 * @return {Promise<challengesModel|Array>}
 */

const subscribeUserToChallenge = async (userId: any, challengeId: any) => {
  try {
    const getUser = await userModel.doc(userId).get()
    const user = getUser.data()
    if (user) {
      const challengeRef = await challengesModel.doc(challengeId)
      await challengeRef.update({ participants: Firestore.FieldValue.arrayUnion(userId) })
      return challengeRef.get()
    } else {
      throw new Error(USER_DOES_NOT_EXIST_ERROR)
    }
  } catch (err) {
    logger.error(CANNOT_SUBSCRIBE, err)
    throw err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fetchChallenges,
  postChallenge,
  subscribeUserToChallenge,
  fetchParticipantsData
}
