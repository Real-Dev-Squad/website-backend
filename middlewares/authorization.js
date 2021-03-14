const { isMember } = require('../models/members')
module.exports = (req, res, next) => {
  try {
    const { username } = req.userData
    const isUserMember = isMember(username)
    if (!isUserMember) {
      return res.boom.forbidden('You are not allowed to create stocks')
    }
    return next()
  } catch (err) {
    logger.error(err)
    return res.boom.forbidden('You are not allowed to create stocks')
  }
}
