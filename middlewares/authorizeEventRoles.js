const { ROLES } = require("../constants/events");
const { getAllEventCodes } = require("../models/events");

const userHasPermission = (userRoles, allowedRoles) => {
  if (typeof userRoles === "object") {
    return allowedRoles.some((role) => userRoles[`${role}`]);
  } else if (typeof userRoles === "string") {
    return allowedRoles.includes(userRoles);
  }

  return false;
};

const authorizeEventRoles = (allowedRoles) => {
  return async (req, res, next) => {
    const rolesAreValid = allowedRoles.every((role) => Object.values(ROLES).includes(role));
    if (!rolesAreValid) {
      return res.boom.badImplementation("Route authorization failed. Please contact admin");
    }

    if (req.userData) {
      const roles = req.userData.roles;
      if (roles) {
        if (req.body.role === ROLES.HOST || userHasPermission(roles, allowedRoles)) {
          return next();
        } else if (req.body.role === ROLES.MODERATOR || userHasPermission(roles, allowedRoles)) {
          return next();
        }
      }
    }

    if (req.body.role === ROLES.MAVEN) {
      const allowedEventCodes = await getAllEventCodes();
      if (allowedEventCodes.includes(req.body.eventCode) || userHasPermission(req.body.role, allowedRoles)) {
        return next();
      }
    }

    if (req.body.role === ROLES.GUEST) {
      if (userHasPermission(req.body.role, allowedRoles)) {
        return next();
      }
    }

    return res.boom.unauthorized("You are not authorized for this action.");
  };
};

module.exports = authorizeEventRoles;
