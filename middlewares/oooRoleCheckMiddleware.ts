import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";
import { REQUEST_TYPE } from "../constants/requests";
import { devFlagMiddleware } from "./devFlag";
import authorizeRoles from "./authorizeRoles";
const { SUPERUSER } = require("../constants/roles");

/**
 * Conditional middleware that applies devFlag and superuser checks only for OOO requests.
 * This allows onboarding requests to bypass these checks while maintaining security for OOO operations.
 * 
 * @param {CustomRequest} req - The request object
 * @param {CustomResponse} res - The response object  
 * @param {NextFunction} next - The next middleware function
 */
export const oooRoleCheckMiddleware = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const requestType = req.body?.type;


  if (requestType === REQUEST_TYPE.OOO) {
     //TODO: Remove this middleware once the OOO feature is tested and ready to be used
    devFlagMiddleware(req, res, (err: any) => {
      if (err) return next(err);
      authorizeRoles([SUPERUSER])(req, res, next);
    });
  } else {

    next();
  }
};