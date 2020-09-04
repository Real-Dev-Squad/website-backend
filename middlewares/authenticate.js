const config = require('config')
const logger = require('../utils/logger')
const authService = require('../services/authService')
const users = require('../models/users')

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies[config.get('userToken.cookieName')]
    const decoded = authService.verifyAuthToken(token)

    // @todo: Refresh JWT if `(timeToExpire - currentTime) >= someThreshold`
    // add user data to `req.userData` for further use
    req.userData = await users.fetchUser(decoded.userId)
    next()
  } catch (err) {
    logger.error(err)
    return res.boom.unauthorized('Unauthenticated User')
  }
}
