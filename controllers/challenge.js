const challengeQuery = require('../models/challenges')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const sendChallengeResponse = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const allChallenges = await challengeQuery.fetchChallenges()
      const challengesWithParticipants = await getParticipantsofChallenges(allChallenges)
      if (challengesWithParticipants.length > 0) {
        return res.status(200).json({
          message: 'Challenges returned successfully!',
          challenges: challengesWithParticipants
        })
      } else {
        return res.status(204).send()
      }
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
    return ''
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
  return await Promise.all(allChallenges.map(async (challenge) => {
    const participants = await challengeQuery.fetchParticipantsData(challenge.participants)
    return {
      ...challenge,
      participants
    }
  }))
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
  sendChallengeResponse,
  subscribeToChallenge
}
