import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global.js";

export const userAuthorization = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  if (req.params.userId === req.userData.id) {
    return next();
  }
  res.boom.forbidden("Unauthorized access");
};
