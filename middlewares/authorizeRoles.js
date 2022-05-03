const {
  ROLES: { SUPERUSER, APPOWNER, MEMBER },
} = require("../constants/users");

const VALID_ROLES = [SUPERUSER, APPOWNER, MEMBER];

/**
 * Check if the user has authorization based on their role.
 * @param {Array.<String>} allowedRoles - Allowed roles for API consumption.
 * @param {Object} userRoles - Roles information of the current user.
 * @returns {Boolean} - Whether the current user is authorized or not.
 */
const userHasPermission = (allowedRoles, userRoles) => {
  return allowedRoles.some((role) => userRoles[`${role}`] === true);
};

/**
 * Checks the validations of allowed roles
 * @param {Array.<String>} roles - Authorized roles set for the API.
 * @returns {Boolean} - Whether all the authorized roles are vaild or not
 */
const validateRoles = (roles) => {
  return roles.every((role) => VALID_ROLES.includes(role));
};

/**
 * Create an authorization middleware for a route based on the required role needed
 * for that route.
 * Note: This must be added on routes after the `authenticate` middleware.
 * @param {Array.<String>} allowedRoles - Roles allowed for a route.
 * @returns {Function} - A middleware function that authorizes given role.
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    const { roles = {} } = req.userData;

    if (!validateRoles(allowedRoles)) {
      return res.boom.badImplementation("Route authorization failed. Please contact admin");
    }
    if (!userHasPermission(allowedRoles, roles)) {
      return res.boom.unauthorized("You are not authorized for this action.");
    }

    return next();
  };
};

module.exports = {
  authorizeRoles,
  userHasPermission,
  validateRoles,
};
