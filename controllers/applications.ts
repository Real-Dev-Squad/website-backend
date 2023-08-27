import { Request, Response, application } from "express";
import { addLog } from "../models/logs";
import { logType } from "../constants/logs";

const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const jwt = require("jsonwebtoken");
const ApplicationModel = require("../models/applications");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

/**
 * Adds a tag to an item with its corresponding a level
 *
 * @param res {Object} - Express response object
 */

const getAllOrUserApplication = async (req: Request, res): Promise<any> => {
  try {
    const { userId } = req.query;
    if (userId) {
      const application = await ApplicationModel.getUserApplications(userId);
      return res.json({
        message: "application returned successfully!",
        application,
      });
    }

    const applications = await ApplicationModel.getAllApplications();
    return res.json({
      message: "application returned successfully!",
      applications,
    });
  } catch (err) {
    logger.error(`Error in fetching application: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
}

const addApplication = async (req: any, res: any) => {
  const rawData = req.body;
  const application = await ApplicationModel.getUserApplications(req.userData.id);

  if (application && !application.status) {
    return res.status(409).json({
      message: "User data is already present!",
    });
  }
  const data = {
    userId: req.userData.id,
    biodata: {
      firstName: rawData.firstName,
      lastName: rawData.lastName,
    },
    location: {
      city: rawData.city,
      state: rawData.state,
      country: rawData.country,
    },
    professional: {
      institution: rawData.college,
      skills: rawData.skills,
    },
    intro: {
      introduction: rawData.introduction,
      funFact: rawData.funFact,
      forFun: rawData.forFun,
      whyRds: rawData.whyRds,
      numberOfHours: rawData.numberOfHours,
    },
    foundFrom: rawData.foundFrom,
  };
  await ApplicationModel.addApplication(data);

  return res.status(201).json({
    message: "User join data and newstatus data added and updated successfully",
  });
};

const updateApplication = async (req: any, res: any) => {
  try {
    const { applicationId } = req.params;
    const { generate_discord_link } = req.query;
    const rawBody = req.body;
    
    if (generate_discord_link) {
      const channelId = config.get("discordNewComersChannelId");
      const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
        algorithm: "RS256",
        expiresIn: config.get("rdsServerlessBot.ttl"),
      });

      const inviteOptions = {
        max_uses: 1, // Maximum number of times the invite can be used (optional)
        unique: true, // Whether to create a unique invite or not (optional)
      };
      const response = await fetch(`${DISCORD_BASE_URL}/channels/${channelId}/invites`, {
        method: "POST",
        body: JSON.stringify(inviteOptions),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      }).then((response) => response.json());

      const inviteCode = response.code;
      const inviteLink = `discord.gg/${inviteCode}`;

      rawBody["discord_invite_link"] = inviteLink;
    }

    const applicationLog = {
      type: logType.APPLICATION_UPDATED,
      meta: {
        applicationId,
        username: req.userData.username,
        userId: req.userData.id,
      },
      body: rawBody
    };

    const promises = [
      ApplicationModel.updateApplication(rawBody, applicationId),
      addLog(applicationLog.type, applicationLog.meta, applicationLog.body),
    ];

    await Promise.all(promises);
    return res.json({
      message: "Application updated successfully!",
    });

  } catch (err) {
    logger.error(`Error while fetching all the intros: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllOrUserApplication,
  addApplication,
  updateApplication,
};
