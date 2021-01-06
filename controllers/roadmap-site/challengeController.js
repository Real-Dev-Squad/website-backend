const logger = require('../../utils/logger')
const challengeQuery = require('../../models/roadmap-site/challenges')
const subscribeToChallengeQuery = require('../../models/roadmap-site/subscribe-challenge')

const errorAdminString = 'Something went wrong, please try again/contact admin'
/**
 * Get the challenges or add the challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendChallengeResponse = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const allChallenges = await challengeQuery.fetchChallenges()
      if (allChallenges.length > 0) {
        return res.status(200).json({
          message: 'Challenges returned successfully!',
          challenges: allChallenges
        })
      } else {
        return res.boom.notFound('No challenges found')
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
        return res.boom.notFound('Not able to add challenge')
      }
    }
  } catch (err) {
    logger.error(`Error while retriving challenges ${err}`)
    return res.boom.serverUnavailable(errorAdminString)
  }
  return ''
}
/**
 * Suscribe user to a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const subscribeToChallenge = async (req, res) => {
  try {
    const { user_id: userId, challenge_id: challengeId } = req.body
    const subscribeUser = await subscribeToChallengeQuery.subscribeUserToChallenge(userId, challengeId)
    if (subscribeUser) {
      return res.status(200).json({
        message: 'user has suscribed to challenge'
      })
    } else {
      return res.boom.notFound('user cannot be suscribed to challenge')
    }
  } catch (err) {
    logger.error(`Error while retriving challenges ${err}`)
    return res.boom.serverUnavailable(errorAdminString)
  }
}

module.exports = {
  sendChallengeResponse,
  subscribeToChallenge
}
