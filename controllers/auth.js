const passport = require("passport");
const users = require("../models/users");
const QrCodeAuthModel = require("../models/qrCodeAuth");
const authService = require("../services/authService");
const { SOMETHING_WENT_WRONG, DATA_ADDED_SUCCESSFULLY, BAD_REQUEST } = require("../constants/errorMessages");

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
        // github_account_created_at: user.created_at,
        created_at: Date.now(),
        updated_at: Date.now(),
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

/**
 * Stores user-device data inside the DB for mobile auth
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const storeUserDeviceInfo = async (req, res) => {
  try {
    const userJson = {
      user_id: req.body.user_id,
      device_info: req.body.device_info,
      device_id: req.body.device_id,
      authorization_status: "NOT_INIT",
    };

    const userInfo = await QrCodeAuthModel.storeUserDeviceInfo(userJson);

    if (!userInfo) {
      return res.status(404).json({
        message: BAD_REQUEST,
      });
    }

    return res.status(201).json({
      ...userInfo,
      message: DATA_ADDED_SUCCESSFULLY,
    });
  } catch (err) {
    logger.error(`Error while storing user device info : ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

const updateAuthStatus = async (req, res) => {
  try {
    const userId = req.userData.id;
    const authStatus = req.params.authorization_status;
    const result = await QrCodeAuthModel.updateStatus(userId, authStatus);

    if (!result.userExists) {
      return res.boom.notFound("Document not found!");
    }

    return res.json({
      message: `Authentication document for user ${userId} updated successfully`,
      data: { ...result.data },
    });
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

const fetchUserDeviceInfo = async (req, res) => {
  try {
    const deviceId = req.query.device_id;
    const userDeviceInfoData = await QrCodeAuthModel.retrieveUserDeviceInfo(deviceId);
    if (!userDeviceInfoData.userExists) {
      return res.boom.notFound(`User with id ${deviceId} does not exist.`);
    }
    return res.json({
      message: "Authentication document retrieved successfully.",
      data: { ...userDeviceInfoData.data },
    });
  } catch (error) {
    logger.error(`Error while fetching user: ${error}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};

module.exports = {
  githubAuthLogin,
  githubAuthCallback,
  signout,
  storeUserDeviceInfo,
  updateAuthStatus,
  fetchUserDeviceInfo,
};
