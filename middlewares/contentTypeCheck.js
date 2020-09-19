/**
 * Middleware to validate the content-type header.
 * Only `application/json` content-type is supported by the API
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express middleware function
 */
module.exports = async (req, res, next) => {
  if (req.headers['content-type'] && req.headers['content-type'] !== 'application/json') {
    return res.boom.badRequest(`Invalid content-type header: ${req.headers['content-type']}, expected: application/json`)
  }

  return next()
}
