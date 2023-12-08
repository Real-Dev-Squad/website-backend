import { addLog } from "../models/logs";
const { logType } = require("../constants/logs");
import { CustomRequest, CustomResponse } from "../types/global";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const ApplicationModel = require("../models/applications");
const { API_RESPONSE_MESSAGES } = require("../constants/application");
const { getUserApplicationObject } = require("../utils/application");

const getAllOrUserApplication = async (req: CustomRequest, res: CustomResponse): Promise<any> => {
  try {
    const { userId, status } = req.query;
    if (userId) {
      const applications = await ApplicationModel.getUserApplications(userId);

      if (!applications.length) return res.boom.notFound("User application not found");

      return res.json({
        message: "User applications returned successfully!",
        applications,
      });
    }

    if (status) {
      const applicationsWithStatus = await ApplicationModel.getApplicationsBasedOnStatus(status);
      return res.json({
        message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
        applications: applicationsWithStatus,
      });
    }

    const applications = await ApplicationModel.getAllApplications();
    return res.json({
      message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
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
    const applications = await ApplicationModel.getApplicationsBasedOnStatus("pending", req.userData.id);
    if (applications.length) {
      return res.status(409).json({
        message: "User application is already present!",
      });
    }
    const data = getUserApplicationObject(rawData, req.userData.id);
    await ApplicationModel.addApplication(data);

    return res.status(201).json({
      message: "User application added.",
    });
  } catch (err) {
    logger.error(`Error while adding application: ${err}`);
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
    logger.error(`Error while updating the application: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getApplicationById = async (req: CustomRequest, res: CustomResponse) => {
  const { applicationId } = req.params;
  const application = await ApplicationModel.getApplicationById(applicationId);

  if (application.notFound) {
    return res.boom.notFound("Application not found");
  }

  return res.json({
    message: "Application returned successfully",
    application,
  });
};

module.exports = {
  getAllOrUserApplication,
  addApplication,
  updateApplication,
  getApplicationById,
};
