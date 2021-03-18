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
    const { title, level, start_date: startDate, end_date: endDate } = req.body
    if (!title || !level || !startDate || !endDate) {
      return res.boom.badData('Empty fields received!')
    }

    const challengeId = await challengeQuery.postChallenge({ title, level, startDate, endDate })
    if (!challengeId) {
      return res.boom.badImplementation('An error occured while creating challenges')
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
 * Suscribe user to a challenge
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const subscribeToChallenge = async (req, res) => {
  try {
    const { user_id: userId, challenge_id: challengeId } = req.body
    const subscribeUser = await challengeQuery.subscribeUserToChallenge(userId, challengeId)

    if (!subscribeUser) {
      return res.boom.notFound('User cannot be subscribed to challenge')
    }
    return res.json({
      message: 'User has subscribed to challenge'
    })
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
