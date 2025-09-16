import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global.d.js";
import { REQUEST_TYPE } from "../constants/requests.js";
import { devFlagMiddleware } from "./devFlag.js";
import { authorizeRoles } from "./authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const { SUPERUSER } = ROLES;

export const oooRoleCheckMiddleware = (
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction
) => {
  const requestType = req.body?.type;

  if (requestType === REQUEST_TYPE.OOO) {
    // TODO: Remove this middleware once the OOO feature is tested and ready 
    return devFlagMiddleware(req, res, (err) => {
      if (err) return next(err);

      try {
        return authorizeRoles([SUPERUSER])(req, res, next);
      } catch (authErr) {
        return next(authErr);
      }
    });
  }

  return next();
};
