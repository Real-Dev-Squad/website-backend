const contributionsService = require('../services/contributions')

const ERROR_MESSAGE = 'Something went wrong. Please try again or contact admin'

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

async function getUserContributions (req, res) {
  try {
    const username = req.params.username
    const contributions = await contributionsService.getUserContributions(username)
    return res.status.json(contributions)
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`)
    return res.boom.serverUnavailable(ERROR_MESSAGE)
  }
}

module.exports = {
  getUserContributions
}
