import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";

const checkCanGenerateDiscordLink = async (
  req:  CustomRequest,
  res: CustomResponse,
  next: NextFunction
) => {
  const { discordId, roles, id: userId } = req.userData;
  const isSuperUser = roles.super_user;
  const userIdInQuery = req.query.userId;
  if ((userIdInQuery && userIdInQuery !== userId && !isSuperUser) || discordId || roles.archived) {
    return res.boom.forbidden("You are restricted from performing this action");
  }
  return next();
};

module.exports = checkCanGenerateDiscordLink;
