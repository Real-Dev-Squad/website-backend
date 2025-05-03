import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global.js";
import logger from "../utils/logger.js";

/**
 * This middleware authorizes if the requested resource belongs to that user or the user is a superuser
 * for that route.
 * Note: This must be added on routes after the `authenticate` middleware.
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 * @param next {Function} - Express middleware function
 * @return {Object} - Returns unauthorized user if the role is not assigned
 *
 **/
const authorizeOwnOrSuperUser = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  try {
    const isSuperUser = req.userData.roles.super_user;
    const { id } = req.userData;
    const userIdInQuery = req.query.userId;

    if (isSuperUser || userIdInQuery === id) return next();
    else return res.boom.forbidden("Unauthorized User");
  } catch (err) {
    logger.error(err);
    return res.boom.badImplementation("Something went wrong please contact admin");
  }
};

export { authorizeOwnOrSuperUser };
