/**
 * Middleware to attach Cache header.
 * https://support.cloudflare.com/hc/en-us/articles/200172516-Understanding-Cloudflare-s-CDN
 * @todo: Remove the middleware for all routes and modify cache max-age of each route individually as per required
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express middleware function
 */

/**
 * Read about CF and Cache headers here: https://developers.cloudflare.com/cache/about/cache-control
 * Cache assets with revalidation, but allow stale responses if origin server is unreachable
 * e.g Cache-Control: public, max-age=900, stale-if-error=600
 * With this configuration, Cloudflare attempts to revalidate the content with the origin server after it has been in cache for N seconds.
 * If the server returns an error instead of proper revalidation responses, Cloudflare continues serving the stale resource for a total M seconds beyond the expiration of the resource.
 */

module.exports = (req, res, next) => {
  try {
    const cacheExpiry = config.get('routesCacheTTL');
    let cacheControl = 'private, max-age=0';
    const ttl = cacheExpiry[req.path];

    if (ttl > 0) {
      cacheControl = `public, max-age=${ttl}, stale-if-error=300`;
    }

    res.header('Cache-Control', cacheControl);
  } catch (e) {
    logger.error(`Error finding TTL config:: ${e}`);
  }

  next();
};
