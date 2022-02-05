/**
 * Middleware to attach Cache header.
 * https://support.cloudflare.com/hc/en-us/articles/200172516-Understanding-Cloudflare-s-CDN
 * @todo: Remove the middleware for all routes and modify cache max-age of each route individually as per required
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express middleware function
 */

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = (req: any, res: any, next: any) => {
  res.header('Cache-Control', 'max-age=0')
  next()
}
