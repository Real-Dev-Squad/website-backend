const { ROLES } = require("../constants/events");
const { getAllEventCodes } = require("../models/events");

const authorizeEventRoles = async (allowedRoles) => {
  return async (req, res, next) => {
    const { roles = {} } = req.userData;

    const rolesAreValid = allowedRoles.every((role) => Object.values(ROLES).includes(role));
    if (!rolesAreValid) {
      return res.boom.badImplementation("Route authorization failed. Please contact admin");
    }
    if (roles[ROLES.HOST]) {
      // super_user
      return next();
    } else if (req.body.eventCode) {
      // maven
      const allowedEventCodes = await getAllEventCodes();
      if (allowedEventCodes.includes(req.body.eventCode)) {
        return next();
      }
    } else if (req.body.role && req.body.role === ROLES.GUEST) {
      // guest
      return next();
    }

    return res.boom.unauthorized("You are not authorized for this action.");
  };
};

module.exports = authorizeEventRoles;
