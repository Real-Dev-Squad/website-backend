const authService = require("../services/authService");
const dataAccess = require("../services/dataAccessLayer");

/**
 * Middleware to check if the authenticated user has restricted permissions.
 *
 * - If the user is impersonating, restrict to only `GET` and `PATCH` requests with `action=STOP`.
 * - If the user has a `restricted` role, disallow all non-GET requests.
 *
 * This middleware must be invoked after successful authentication.
 *
 * @param {Object} req - Express request object. Expects `userData` and `isImpersonating` to be set.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object|void} Responds with `403 Forbidden` if action is not permitted; otherwise calls `next()`.
 */
const checkRestricted = async (req, res, next) => {
  const { roles } = req.userData;

  if (req.isImpersonating) {
    const isStopImpersonationRoute =
      req.method === "PATCH" &&
      req.baseUrl === "/impersonation" &&
      /^\/[a-zA-Z0-9_-]+$/.test(req.path) &&
      req.query.action === "STOP";

    if (req.method !== "GET" && !isStopImpersonationRoute) {
      return res.boom.forbidden("You are not allowed for this operation at the moment");
    }
  }

  if (roles && roles.restricted && req.method !== "GET") {
    return res.boom.forbidden("You are restricted from performing this action");
  }

  return next();
};

/**
 * Authentication Middleware
 *
 * 1. Verifies the user's JWT (from cookie or Bearer header in non-production).
 * 2. If the token is valid, attaches user info to `req.userData`.
 * 3. If impersonation is active, uses the impersonated user for `req.userData`.
 * 4. If the JWT is expired but within `refreshTtl`, issues a new token and continues.
 * 5. Applies role-based restrictions via `checkRestricted()`.
 *
 * @todo Add test cases to validate JWT refresh logic by simulating token expiry and TTL.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Object|void} - Returns `401 Unauthorized` if the user is unauthenticated; otherwise continues to `checkRestricted`.
 */
module.exports = async (req, res, next) => {
  try {
    let token = req.cookies[config.get("userToken.cookieName")];

    // Allow Bearer token in non-production (e.g., for Swagger UI)
    if (process.env.NODE_ENV !== "production" && !token) {
      token = req.headers.authorization?.split(" ")[1];
    }

    const { userId, impersonatedUserId } = authService.verifyAuthToken(token);
    req.isImpersonating = Boolean(impersonatedUserId);

    let userData;
    if (impersonatedUserId) {
      userData = await dataAccess.retrieveUsers({ id: impersonatedUserId });
    } else {
      userData = await dataAccess.retrieveUsers({ id: userId });
    }

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

      // Refresh token if within allowed refresh window
      if (Math.floor(Date.now() / 1000) - iat <= refreshTtl) {
        res.cookie(config.get("userToken.cookieName"), newToken, {
          domain: rdsUiUrl.hostname,
          expires: new Date(Date.now() + config.get("userToken.ttl") * 1000),
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });

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
