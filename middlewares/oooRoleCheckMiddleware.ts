import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";
import { REQUEST_TYPE } from "../constants/requests";
import { devFlagMiddleware } from "./devFlag";
import authorizeRoles from "./authorizeRoles";

const { SUPERUSER } = require("../constants/roles");

export const oooRoleCheckMiddleware = (
  req: CustomRequest,
  res: CustomResponse,
  next: NextFunction
) => {
  const requestType = req.body?.type;

  if (requestType === REQUEST_TYPE.OOO) {
    try {
      return authorizeRoles([SUPERUSER])(req, res, next);
    } catch (authErr) {
      return next(authErr);
    }
  }

  return next();
};
