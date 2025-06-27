import { NextFunction } from "express";
import authorizeRoles from "./authorizeRoles";
const { SUPERUSER } = require("../constants/roles");
import { ImpersonationRequestResponse, ImpersonationSessionRequest } from "../types/impersonationRequest";
import { INVALID_ACTION_PARAM } from "../constants/requests";

/**
 * Middleware to authorize impersonation based on the 'action' query param.
 * - START → Requires SUPERUSER role.
 * - STOP → Allows without additional checks.
 * - Invalid or missing action → Responds with 400 Bad Request.
 */
export const addAuthorizationForImpersonation = async (
  req: ImpersonationSessionRequest,
  res: ImpersonationRequestResponse,
  next: NextFunction
) => {
  const { action } = req.query;

  if (action === "START") {
    return authorizeRoles([SUPERUSER])(req, res, next);
  }

  if (action === "STOP") {
    return next();
  }

  return res.boom.badRequest(INVALID_ACTION_PARAM);
};
