const { isSuperUser } = require('../models/members')
module.exports = (req, res, next) => {
  try {
    const { username } = req.userData
    if (!isSuperUser(username)) {
      return res.boom.forbidden('You are not allowed to perform this action.')
    }
    return next()
  } catch (err) {
    logger.error(err)
    return res.boom.forbidden('You are not allowed to perform this action.')
  }
}
