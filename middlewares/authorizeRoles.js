const ROLES = require("../constants/roles");

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

    const rolesAreValid = allowedRoles.every((role) => Object.values(ROLES).includes(role));
    if (!rolesAreValid) {
      return res.boom.badImplementation("Route authorization failed. Please contact admin");
    }

    const userHasPermission = allowedRoles.some((role) => roles[`${role}`]);
    if (!userHasPermission) {
      return res.boom.unauthorized("You are not authorized for this action.");
    }

    return next();
  };
};

module.exports = authorizeRoles;
