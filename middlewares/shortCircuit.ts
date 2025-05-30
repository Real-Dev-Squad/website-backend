import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";

export const disableRoute = (_req: CustomRequest, res: CustomResponse, _next: NextFunction) => {
  return res.boom.serverUnavailable(
    "This route has been temporarily been disabled. If you need help, please reach out to the team."
  );
};
