/**
 * Middleware to check if the user has verified themself with the discord bot.
 *  If user has not verified, then no actions based on discord bot should be allowed.
 * Note: This requires that user is authenticated hence must be called after
 * the user authentication middleware. We are calling it from within the
 * `authenticate` middleware itself to avoid explicitly adding this middleware
 * while defining routes.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express middleware function
 * @returns {Object} - Returns unauthorized object if user has been restricted.
 */
const checkIsVerifiedDiscord = async (req, res, next) => {
  const { discordId, roles } = req.userData;
  if (!discordId || roles.archived) {
    return res.boom.forbidden("You are restricted from performing this action");
  }
  return next();
};

module.exports = checkIsVerifiedDiscord;
