import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";
const ApplicationModel = require("../models/applications");

const checkCanGenerateDiscordLink = async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  const { id: userId, roles } = req.userData;
  const isSuperUser = roles.super_user;
  const userIdInQuery = req.query.userId;
  const currentTime = Date.now();
  const cutoffTime = 1725147849000;  // Todo will remove this Hotfix time for 31 August 2024

  if (isSuperUser) {
    return next();
  }

  if (userIdInQuery && userIdInQuery !== userId && !isSuperUser) {
    return res.boom.forbidden("User should be super user to generate link for other users");
  }

  if (currentTime >= cutoffTime) {
    return res.boom.forbidden("Discord invite link generation is not allowed after the cutoff time.");
  }

  try {
    const applications = await ApplicationModel.getUserApplications(userId);
    
    if (!applications || applications.length === 0) {
      return res.boom.forbidden("No applications found.");
    }

    const approvedApplication = applications.find((application: { status: string; }) => application.status === 'accepted');
    
    if (!approvedApplication) {
      return res.boom.forbidden("Only users with an approved application can generate a Discord invite link.");
    }

    return next();
  } catch (error) {
    return res.boom.badImplementation("An error occurred while checking user applications.");
  }
};

export default checkCanGenerateDiscordLink;

// <------ We have to revisit this later ------->
// <--- https://github.com/Real-Dev-Squad/website-backend/issues/2078 --->


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
