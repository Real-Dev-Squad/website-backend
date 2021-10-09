const challengeQuery = require('../models/challenges')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the challenges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const fetchChallenges = async (req, res) => {
  const allChallenges = await challengeQuery.fetchChallenges()

  if (allChallenges.length > 0) {
    return res.json({
      message: 'Challenges returned successfully!',
      challenges: allChallenges
    })
  } else {
    return res.boom.notFound('No challenges found')
  }
}

/**
 * Add a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const createChallenge = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const allChallenges = await challengeQuery.fetchChallenges()
      const promiseArray = await getParticipantsofChallenges(allChallenges)
      const challengesWithParticipants = await Promise.all(promiseArray)
      return res.json({
        message: challengesWithParticipants.length ? 'Challenges returned successfully!' : 'No Challenges found',
        challenges: challengesWithParticipants
      })
    } else {
      if (req.method === 'POST') {
        const challengeAdded = await challengeQuery.postChallenge(req.body)
        if (challengeAdded) {
          return res.status(200).json({
            message: 'Challenge added successfully',
            challenges: challengeAdded
          })
        }
      } else {
        return res.boom.notFound('Unable to add challenge')
      }
    }

    const currentChallenges = await challengeQuery.fetchChallenges()

    // TODO: replace challenges object with challengeId
    return res.json({
      message: 'Challenge added successfully',
      challenges: currentChallenges
    })
  } catch (err) {
    logger.error(`Error while retriving challenges ${err}`)
    return res.boom.serverUnavailable(ERROR_MESSAGE)
  }
}

/**
 * @param {Array} allChallenges
 * @returns {Promise<participants|Array>}
 */
const getParticipantsofChallenges = async (allChallenges) => {
  return allChallenges.map(async (challenge) => {
    const participants = await challengeQuery.fetchParticipantsData(challenge.participants)
    return {
      ...challenge,
      participants
    }
  })
}

/**
 * Suscribe user to a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const subscribeToChallenge = async (req, res) => {
  try {
    const { user_id: userId, challenge_id: challengeId } = req.body
    const subscribeUser = await challengeQuery.subscribeUserToChallenge(userId, challengeId)
    if (subscribeUser) {
      return res.status(200).json({
        challenge_id: challengeId,
        is_user_subscribed: 1
      })
    } else {
      return res.boom.notFound('User cannot be subscribed to challenge')
    }
  } catch (err) {
    logger.error(`Error while retrieving challenges ${err}`)
    return res.boom.serverUnavailable(ERROR_MESSAGE)
  }
}

module.exports = {
  fetchChallenges,
  createChallenge,
  subscribeToChallenge
}
