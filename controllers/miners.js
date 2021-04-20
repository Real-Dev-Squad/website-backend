const minersModel = require('../models/miners')
/**
 * Get Miners data
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const getMiners = async (req, res) => {
  try {
    const allMiners = await minersModel.fetchMiners()
    return res.json({
      message: 'Miners returned successfully!',
      miners: allMiners
    })
  } catch (error) {
    logger.error(`Error while fetching all miners: ${error}`)
    return res.boom.serverUnavailable('Something went wrong please contact admin')
  }
}

module.exports = {
  getMiners
}
