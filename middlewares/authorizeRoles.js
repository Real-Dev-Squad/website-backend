const VALID_ROLES = ["super_user", "app_owner", "member"];

/**
 * Check if the user has enough authorization based on their role.
 * User would have following roles schema -
 * userRoles = {app_owner: true, super_user: true}
 * @param {Array} requiredRole - Required role level to authorize request.
 * @param {Object} userRoles - Roles information of the current user.
 * @returns {Boolean} - Whether the current user is authorized for required role level.
 */
const userHasPermission = (allowedRoles, userRoles) => {
  let permission = false;
  Object.keys(userRoles).forEach((role) => {
    if (userRoles[`${role}`]) {
      if (allowedRoles.includes(role)) permission = true;
    }
  });

  return permission;
};

const validateRoles = (roles) => {
  return roles.every((role) => VALID_ROLES.includes(role));
};

/**
 * Create an authorization middleware for a route based on the required role needed
 * for that route. Currently following roles are supported:
 * - `authorizeUser('superUser')`
 * - `authorizeUser('appOwner')`
 * Note: This must be added on routes after the `authenticate` middleware.
 * @param {String} requiredRole - The least role authority required for a route.
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
