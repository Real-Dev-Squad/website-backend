const authService = require("../services/authService");
const dataAccess = require("../services/dataAccessLayer");

/**
 * Middleware to check if the user has been restricted. If user is restricted,
 * then only allow read requests and do not allow to any edit/create requests.
 *
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
const checkRestricted = async (req, res, next) => {
  const { roles } = req.userData;
  if (roles && roles.restricted && req.method !== "GET") {
    return res.boom.forbidden("You are restricted from performing this action");
  }
  return next();
};

/**
 * Middleware to validate the authenticated routes
 * 1] Verifies the token and adds user info to `req.userData` for further use
 * 2] In case of JWT expiry, adds a new JWT to the response if `currTime - tokenInitialisationTime <= refreshTtl`
 *
 * The currently implemented mechanism satisfies the current use case.
 * Authentication with JWT and a refreshToken to be added once we have user permissions and authorizations to be handled
 *
 * @todo: Add tests to assert on refreshed JWT generation by modifying the TTL values for the specific test. Currently not possible in the absence of a test-suite.
 *
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 * @return {Object} - Returns unauthenticated object if token is invalid
 */
module.exports = async (req, res, next) => {
  try {
    // console.log("from authenticate middleware");
    let token = req.cookies[config.get("userToken.cookieName")];

    /**
     * Enable Bearer Token authentication for NON-PRODUCTION environments
     * This is enabled as Swagger UI does not support cookie authe
     */
    if (process.env.NODE_ENV !== "production" && !token) {
      token = req.headers.authorization.split(" ")[1];
    }

    const { userId } = authService.verifyAuthToken(token);

    // add user data to `req.userData` for further use
    const userData = await dataAccess.retrieveUsers({ id: userId });
    req.userData = userData.user;

    return checkRestricted(req, res, next);
  } catch (err) {
    logger.error(err);

    if (err.name === "TokenExpiredError") {
      const refreshTtl = config.get("userToken.refreshTtl");
      const token = req.cookies[config.get("userToken.cookieName")];
      const { userId, iat } = authService.decodeAuthToken(token);
      const newToken = authService.generateAuthToken({ userId });
      const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));

      // add new JWT to the response if it satisfies the refreshTtl time
      if (Math.floor(Date.now() / 1000) - iat <= refreshTtl) {
        res.cookie(config.get("userToken.cookieName"), newToken, {
          domain: rdsUiUrl.hostname,
          expires: new Date(Date.now() + config.get("userToken.ttl") * 1000),
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });

        // add user data to `req.userData` for further use
        req.userData = await dataAccess.retrieveUsers({ id: userId });
        return checkRestricted(req, res, next);
      } else {
        return res.boom.unauthorized("Unauthenticated User");
      }
    } else {
      return res.boom.unauthorized("Unauthenticated User");
    }
  }
};
