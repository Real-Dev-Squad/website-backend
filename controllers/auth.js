const passport = require("passport");
const users = require("../models/users");
const authService = require("../services/authService");

/**
 * Makes authentication call to GitHub statergy
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
const githubAuthLogin = (req, res, next) => {
  const redirectURL = req.query.redirectURL;
  return passport.authenticate("github", {
    scope: ["user:email"],
    state: redirectURL,
  })(req, res, next);
};

/**
 * Fetches the user info from GitHub and authenticates User
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
const githubAuthCallback = (req, res, next) => {
  let userData;
  const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));
  let authRedirectionUrl = rdsUiUrl;
  if ("state" in req.query) {
    try {
      const redirectUrl = new URL(req.query.state);
      if (`.${redirectUrl.hostname}`.endsWith(`.${rdsUiUrl.hostname}`)) {
        // Matching *.realdevsquad.com
        authRedirectionUrl = redirectUrl;
      } else {
        logger.error(`Malicious redirect URL provided URL: ${redirectUrl}, Will redirect to RDS`);
      }
    } catch (error) {
      logger.error("Invalid redirect URL provided", error);
    }
  }
  try {
    return passport.authenticate("github", { session: false }, async (err, accessToken, user) => {
      if (err) {
        logger.error(err);
        return res.boom.unauthorized("User cannot be authenticated");
      }

      userData = {
        github_id: user.username,
        github_display_name: user.displayName,
        tokens: {
          githubAccessToken: accessToken,
        },
      };

      const { userId, incompleteUserDetails } = await users.addOrUpdate(userData);

      const token = authService.generateAuthToken({ userId });

      // respond with a cookie
      res.cookie(config.get("userToken.cookieName"), token, {
        domain: rdsUiUrl.hostname,
        expires: new Date(Date.now() + config.get("userToken.ttl") * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      if (incompleteUserDetails) authRedirectionUrl = "https://my.realdevsquad.com/new-signup";

      return res.redirect(authRedirectionUrl);
    })(req, res, next);
  } catch (err) {
    logger.error(err);
    return res.boom.unauthorized("User cannot be authenticated");
  }
};

const signout = (req, res) => {
  const cookieName = config.get("userToken.cookieName");
  const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));
  res.clearCookie(cookieName, {
    domain: rdsUiUrl.hostname,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  return res.json({
    message: "Signout successful",
  });
};

module.exports = {
  githubAuthLogin,
  githubAuthCallback,
  signout,
};
