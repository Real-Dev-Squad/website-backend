import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";
const ApplicationModel = require("../models/applications");

const checkCanGenerateDiscordLink = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const { id: userId } = req.userData;
  const currentTime = Date.now();
  const cutoffTime = 1724630399000;  // Epoch time for 25 August 2024

  if (currentTime >= cutoffTime) {
    return res.boom.forbidden("Discord invite link generation is not allowed after the cutoff time.");
  }

  const applications = await ApplicationModel.getUserApplications(userId);
  if (!applications || applications.length === 0) {
    return res.boom.forbidden("No applications found.");
  }

  const approvedApplication = applications.find((application: { status: string; }) => application.status === 'accepted');

  if (!approvedApplication) {
    return res.boom.forbidden("Only users with an approved application can generate a Discord invite link.");
  }
  return next();
};

export default checkCanGenerateDiscordLink;

// <------ We have to revisit this later ------->

// const checkCanGenerateDiscordLink = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
//   const { discordId, roles, id: userId, profileStatus } = req.userData;
//   const isSuperUser = roles.super_user;
//   const userIdInQuery = req.query.userId;

//   if (userIdInQuery && userIdInQuery !== userId && !isSuperUser) {
//     return res.boom.forbidden("User should be super user to generate link for other users");
//   }

//   if (!isSuperUser && discordId) {
//     return res.boom.forbidden("Only users who have never joined discord can generate invite link");
//   }

//   if (roles.archived) {
//     return res.boom.forbidden("Archived users cannot generate invite");
//   }

//   if (!isSuperUser && !roles.maven && !roles.designer && !roles.product_manager && profileStatus !== "VERIFIED") {
//     return res.boom.forbidden("Only selected roles can generate discord link directly");
//   }

//   return next();
// };

module.exports = checkCanGenerateDiscordLink;
