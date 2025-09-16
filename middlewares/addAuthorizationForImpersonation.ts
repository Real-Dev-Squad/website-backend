import { NextFunction } from "express";
import {authorizeRoles} from "./authorizeRoles.js";
import { SUPERUSER } from "../constants/roles.js";
import { ImpersonationRequestResponse, ImpersonationSessionRequest } from "../types/impersonationRequest.js";
import { INVALID_ACTION_PARAM, OPERATION_NOT_ALLOWED } from "../constants/requests.js";

/**
 * Middleware to authorize impersonation actions based on the `action` query parameter.
 *
 * - If `action=START`: Only users with the SUPERUSER role are authorized.
 * - If `action=STOP`: Only allowed if the user is currently impersonating someone (`req.isImpersonating === true`).
 * - If `action` is missing or has an invalid value: Responds with 400 Bad Request.
 *
 * @param {ImpersonationSessionRequest} req - Express request object, extended to include impersonation context.
 * @param {ImpersonationRequestResponse} res - Express response object with Boom error handling.
 * @param {NextFunction} next - Express callback to pass control to the next middleware.
 *
 * @returns {void}
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
    if (!req.isImpersonating) {
      return res.boom.forbidden(OPERATION_NOT_ALLOWED);
    }
    return next();
  }

  return res.boom.badRequest(INVALID_ACTION_PARAM);
};
