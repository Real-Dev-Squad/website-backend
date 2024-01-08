import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";

const checkCanGenerateDiscordLink = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const { discordId, roles, id: userId, profileStatus } = req.userData;
  const isSuperUser = roles.super_user;
  const userIdInQuery = req.query.userId;

  if (userIdInQuery && userIdInQuery !== userId && !isSuperUser) {
    return res.boom.forbidden("User should be super user to generate link for other users");
  }

  if (discordId && !isSuperUser) {
    return res.boom.forbidden("Only users who have never joined discord can generate invite link");
  }

  if (roles.archived) {
    return res.boom.forbidden("Archived users cannot generate invite");
  }

  if (!roles.maven && !roles.designer && !roles.product_manager && profileStatus !== "VERIFIED") {
    return res.boom.forbidden("Only selected roles can generate discord link directly");
  }

  return next();
};

module.exports = checkCanGenerateDiscordLink;
