/**
 * Middleware to validate the content-type header.
 * Only `application/json` content-type is supported by the API
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express middleware function
 */
module.exports = (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType !== 'application/json') {
    const notMultiPart = !contentType.includes('multipart/form-data');
    if (notMultiPart) {
      return res.boom.unsupportedMediaType(
        `Invalid content-type header: ${contentType}, expected: application/json or multipart/form-data`
      );
    }
  }

  return next();
};
