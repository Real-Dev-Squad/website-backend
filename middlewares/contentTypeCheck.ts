/**
 * Middleware to validate the content-type header.
 * Only `application/json` content-type is supported by the API
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express middleware function
 */
// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = (req: any, res: any, next: any) => {
  const contentType = req.headers['content-type']
  if (contentType && (contentType !== 'application/json')) {
    const notMultiPart = !(contentType.includes('multipart/form-data'))
    if (notMultiPart) {
      return res.boom.unsupportedMediaType(`Invalid content-type header: ${contentType}, expected: application/json or multipart/form-data`)
    }
  }

  return next()
}
