import authService from "../services/authService.js";
import dataAccess from "../services/dataAccessLayer.js";
import logger from "../utils/logger.js";

/**
 * Middleware to check if the user is restricted or in an impersonation session.
 *
 * - If the user is impersonating, only GET requests and the STOP impersonation route are allowed.
 * - If the user is restricted (based on roles), only GET requests are permitted.
 *
 * Note: This requires that user is authenticated hence must be called after
 * the user authentication middleware. We are calling it from within the
 * `authenticate` middleware itself to avoid explicitly adding this middleware
 * while defining routes.
 *
 * @async
 * @function checkRestricted
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export const checkRestricted = async (req, res, next) => {
  const { roles } = req.userData;

  if (req.isImpersonating) {
    const isStopImpersonationRoute =
      req.method === "PATCH" &&
      req.baseUrl === "/impersonation" &&
      /^\/[a-zA-Z0-9_-]+$/.test(req.path) &&
      req.query.action === "STOP";

    if (req.method !== "GET" && !isStopImpersonationRoute) {
      return res.boom.forbidden("Only viewing is permitted during impersonation");
    }
  }

  if (roles && roles.restricted && req.method !== "GET") {
    return res.boom.forbidden("You are restricted from performing this action");
  }

  return next();
};

/**
 * Authentication middleware that:
 * 1. Verifies JWT token from cookies (or headers in non-production).
 * 2. Handles impersonation if applicable.
 * 3. Refreshes token if it's expired but still within the refresh TTL window.
 * 4. Attaches user data to `req.userData` for downstream use.
 *
 * @async
 * @function
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} - Calls `next()` on successful authentication or returns an error response.
 */
export default async (req, res, next) => {
  try {
    let token = req.cookies[config.get("userToken.cookieName")];

    /**
     * Enable Bearer Token authentication for NON-PRODUCTION environments.
     * Useful for Swagger or manual testing where cookies are not easily managed.
     */
    if (process.env.NODE_ENV !== "production" && !token) {
      token = req.headers.authorization?.split(" ")[1];
    }

    const { userId, impersonatedUserId } = authService.verifyAuthToken(token);
    // `req.isImpersonating` keeps track of the impersonation session
    req.isImpersonating = Boolean(impersonatedUserId);

    const userData = impersonatedUserId
      ? await dataAccess.retrieveUsers({ id: impersonatedUserId })
      : await dataAccess.retrieveUsers({ id: userId });

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

        const userData = await dataAccess.retrieveUsers({ id: userId });
        req.userData = userData.user;

        return checkRestricted(req, res, next);
      }
      return res.boom.unauthorized("Unauthenticated User");
    }
    return res.boom.unauthorized("Unauthenticated User");
  }
};
