// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'require'. Do you need to install... Remove this comment to see the full error message
const challengeQuery = require('../models/challenges')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'ERROR_MESS... Remove this comment to see the full error message
const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the challenges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchChall... Remove this comment to see the full error message
const fetchChallenges = async (req: any, res: any) => {
  try {
    const allChallenges = await challengeQuery.fetchChallenges()
    const promiseArray = await getParticipantsofChallenges(allChallenges)
    const challengesWithParticipants = await Promise.all(promiseArray)
    return res.json({
      message: challengesWithParticipants.length ? 'Challenges returned successfully!' : 'No Challenges found',
      challenges: challengesWithParticipants
    })
  } catch (err) {
    logger.error(`Error while retrieving challenges ${err}`)
    return res.boom.serverUnavailable(ERROR_MESSAGE)
  }
}

/**
 * Add a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createChal... Remove this comment to see the full error message
const createChallenge = async (req: any, res: any) => {
  try {
    const challengeAdded = await challengeQuery.postChallenge(req.body)
    if (challengeAdded) {
      return res.json({
        message: 'Challenge added successfully'
      })
    } else {
      return res.boom.badRequest('Unable to add challenge')
    }
  } catch (err) {
    logger.error(`Error while adding challenge ${err}`)
    return res.boom.serverUnavailable(ERROR_MESSAGE)
  }
}

/**
 * @param {Array} allChallenges
 * @returns {Promise<participants|Array>}
 */
const getParticipantsofChallenges = async (allChallenges: any) => {
  return allChallenges.map(async (challenge: any) => {
    const participants = await challengeQuery.fetchParticipantsData(challenge.participants)
    return {
      ...challenge,
      participants
    }
  });
}

/**
 * Suscribe user to a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const subscribeToChallenge = async (req: any, res: any) => {
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

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  fetchChallenges,
  createChallenge,
  subscribeToChallenge
}
