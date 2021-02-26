const logger = require('../utils/logger')
const userQuery = require('../models/crypto')

/**
 * Fetches the data about the user
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */


const getUser = async (req, res) => {
  try { 
    const userInfo = await userQuery.fetchUser(req.query.user_id)
  
    if(userInfo) {
      const transaction = userInfo.transaction
      const transactionCount = 7

      userInfo.transaction = transaction.slice(0, transactionCount)

      return res.json({
        message: 'User returned successfully!',
        userInfo,
      })
    }
    return res.boom.notFound('User doesn\'t exist')

  } catch (error) {
    logger.error(`Error while fetching the user data: ${error}`)
    return res.boom.badImplementation('Something went wrong please contact admin')
  }
}


module.exports = {
  getUser
}