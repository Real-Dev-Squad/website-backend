const passport = require("passport");
const users = require("../models/users");
const QrCodeAuthModel = require("../models/qrCodeAuth");
const authService = require("../services/authService");
const dataAccess = require("../services/dataAccessLayer");
const {
  SOMETHING_WENT_WRONG,
  DATA_ADDED_SUCCESSFULLY,
  USER_DOES_NOT_EXIST_ERROR,
} = require("../constants/errorMessages");

/**
 * Makes authentication call to GitHub statergy
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 */
const githubAuthLogin = (req, res, next) => {
  let { sourceUtm, redirectURL } = req.query;

  const isMobileApp = sourceUtm === "rds-mobile-app";

  if (isMobileApp) {
    const newUrl = new URL(redirectURL);
    newUrl.searchParams.set("isMobileApp", true);
    redirectURL = newUrl.toString();
  }
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
  let isMobileApp = false;
  const rdsUiUrl = new URL(config.get("services.rdsUi.baseUrl"));
  let authRedirectionUrl = rdsUiUrl;
  let devMode = false;
  let isV2FlagPresent = false;

  if ("state" in req.query) {
    try {
      const redirectUrl = new URL(req.query.state);
      if (redirectUrl.searchParams.get("isMobileApp") === "true") {
        isMobileApp = true;
        redirectUrl.searchParams.delete("isMobileApp");
      }

      if (redirectUrl.searchParams.get("v2") === "true") isV2FlagPresent = true;

      if (`.${redirectUrl.hostname}`.endsWith(`.${rdsUiUrl.hostname}`)) {
        // Matching *.realdevsquad.com
        authRedirectionUrl = redirectUrl;
        devMode = Boolean(redirectUrl.searchParams.get("dev"));
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
        github_created_at: Number(new Date(user._json.created_at).getTime()),
        github_user_id: user.id,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      const { userId, incompleteUserDetails, role } = await users.addOrUpdate(userData);

      const token = authService.generateAuthToken({ userId });

      const cookieOptions = {
        domain: rdsUiUrl.hostname,
        expires: new Date(Date.now() + config.get("userToken.ttl") * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      };
      // respond with a cookie
      res.cookie(config.get("userToken.cookieName"), token, cookieOptions);

      /* redirectUrl woud be like https://realdevsquad.com?v2=true */
      if (isV2FlagPresent) {
        const tokenV2 = authService.generateAuthToken({ userId, role });
        res.cookie(config.get("userToken.cookieV2Name"), tokenV2, cookieOptions);
      }

      if (!devMode) {
        // TODO: Revisit incompleteUserDetails redirect condition
        if (incompleteUserDetails) authRedirectionUrl = "https://my.realdevsquad.com/new-signup";
      }

      if (isMobileApp) {
        const newUrl = new URL(authRedirectionUrl);
        newUrl.searchParams.set("token", token);
        authRedirectionUrl = newUrl.toString();
      }
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
  const cookieOptions = {
    domain: rdsUiUrl.hostname,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  };
  res.clearCookie(cookieName, cookieOptions);
  const cookieV2Name = config.get("userToken.cookieV2Name");
  res.clearCookie(cookieV2Name, cookieOptions);
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

    const userInfoData = await dataAccess.retrieveUsers({ id: userJson.user_id });

    if (!userInfoData.userExists) {
      return res.boom.notFound(USER_DOES_NOT_EXIST_ERROR);
    }
    const userInfo = await QrCodeAuthModel.storeUserDeviceInfo(userJson);

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
    let token;
    if (authStatus === "AUTHORIZED") {
      token = authService.generateAuthToken({ userId });
    }
    const result = await QrCodeAuthModel.updateStatus(userId, authStatus, token);

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
    const { device_id: deviceId } = req.query;
    const userDeviceInfoData = await QrCodeAuthModel.retrieveUserDeviceInfo({ deviceId });
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

const fetchDeviceDetails = async (req, res) => {
  try {
    const userId = req.userData.id;
    const userDeviceInfoData = await QrCodeAuthModel.retrieveUserDeviceInfo({ userId });
    if (!userDeviceInfoData.userExists) {
      return res.boom.notFound(`User with id ${userId} does not exist.`);
    }
    return res.json({
      message: "Authentication document Exists",
      data: { device_info: userDeviceInfoData.data?.device_info },
    });
  } catch (error) {
    logger.error(`Error while fetching user device info: ${error}`);
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
  fetchDeviceDetails,
};
