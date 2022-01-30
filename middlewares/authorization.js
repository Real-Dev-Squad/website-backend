/**
 * Describe the priority order of roles. Any route requiring `x` role is allowed
 * for user having authority of role `x` or a higher authority.
 * For e.g
 * - Route requiring `superUser` role is only allowed for `super_user`.
 * - Route requiring `appOwner` role is allowed for `superUser` and `app_owner`.
 */
const REQUIRED_ROLES_PRIORITY = {
  superUser: ['super_user'],
  appOwner: ['app_owner', 'super_user'],
  default: ['default', 'super_user', 'app_owner'],
};

/**
 * Check if the user has enough authorization based on their role.
 * User would have following roles schema -
 * userRoles = {app_owner: true, super_user: true}
 * @param {String} requiredRole - Required role level to authorize request.
 * @param {Object} userRoles - Roles information of the current user.
 * @returns {Boolean} - Whether the current user is authorized for required role level.
 */
const userHasPermission = (requiredRole, userRoles) => {
  const allowedRoles = REQUIRED_ROLES_PRIORITY[`${requiredRole}`] || ['default'];
  return allowedRoles.some((role) => {
    return Boolean(userRoles[`${role}`]);
  });
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
const authorizeUser = (requiredRole) => {
  return (req, res, next) => {
    const { roles = {} } = req.userData;
    // All users should have `default` role
    roles.default = true;

    if (!userHasPermission(requiredRole, roles)) {
      return res.boom.unauthorized('You are not authorized for this action.');
    }
    return next();
  };
};

module.exports = {
  authorizeUser,
  userHasPermission,
};
