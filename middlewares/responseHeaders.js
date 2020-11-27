/**
 * Middleware to attach Cache header.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express middleware function
 */

module.exports = (req, res, next) => {
  res.header('Cache-Control', 'no-store')
  next()
}
