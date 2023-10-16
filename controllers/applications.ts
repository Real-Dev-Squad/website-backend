import { addLog } from "../models/logs";
import { logType } from "../constants/logs";
import { CustomRequest, CustomResponse } from "../types/global";

const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const jwt = require("jsonwebtoken");
const ApplicationModel = require("../models/applications");

const getAllOrUserApplication = async (req: CustomRequest, res: CustomResponse): Promise<any> => {
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
      message: "applications returned successfully!",
      applications,
    });
  } catch (err) {
    logger.error(`Error in fetching application: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const addApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const rawData = req.body;
    const application = await ApplicationModel.getUserApplications(req.userData.id);
    if (!application.notFound && !application.status) {
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
      message: "User application added.",
    });
  } catch (err) {
    logger.error(`Error while fetching all the intros: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const updateApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { applicationId } = req.params;
    const rawBody = req.body;

    const applicationLog = {
      type: logType.APPLICATION_UPDATED,
      meta: {
        applicationId,
        username: req.userData.username,
        userId: req.userData.id,
      },
      body: rawBody,
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
