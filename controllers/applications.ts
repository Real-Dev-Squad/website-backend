import { addLog } from "../models/logs";
const { logType } = require("../constants/logs");
import { CustomRequest, CustomResponse } from "../types/global";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const ApplicationModel = require("../models/applications");
const { API_RESPONSE_MESSAGES, APPLICATION_ERROR_MESSAGES } = require("../constants/application");
const { createApplicationService } = require("../services/applicationService");
const { Conflict } = require("http-errors");
const logger = require("../utils/logger");
const { convertDaysToMilliseconds } = require("../utils/time");
const { APPLICATION_STATUS_TYPES } = require("../constants/application");

const getAllOrUserApplication = async (req: CustomRequest, res: CustomResponse): Promise<any> => {
  try {
    const { userId, status, next, size, dev } = req.query;
    const limit = Number(size) || 25;
    let nextPageUrl = null;
    const isDevMode = dev === "true";

    if (userId) {
      const applications = await ApplicationModel.getUserApplications(userId);

      return res.json({
        message: "User applications returned successfully!",
        applications,
      });
    }

    if (status) {
      const { applications, lastDocId, totalCount } = await ApplicationModel.getApplicationsBasedOnStatus(
        status,
        limit,
        next
      );

      if (applications.length === limit) {
        nextPageUrl = `/applications?next=${lastDocId}&size=${limit}&status=${status}`;
      }

      const response = {
        message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
        applications,
        next: nextPageUrl,
      };
      if (isDevMode) {
        response["totalCount"] = totalCount;
      }

      return res.json(response);
    }

    const { applications, lastDocId } = await ApplicationModel.getAllApplications(limit, next);

    if (applications.length === limit) {
      nextPageUrl = `/applications?next=${lastDocId}&size=${limit}`;
    }

    return res.json({
      message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
      applications,
      next: nextPageUrl,
    });
  } catch (err) {
    logger.error(`Error in fetching application: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const addApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const rawData = req.body;
    const userId = req.userData.id;

    const result = await createApplicationService({
      userId,
      payload: rawData,
    });

    const applicationLog = {
      type: logType.APPLICATION_ADDED,
      meta: {
        username: req.userData.username,
        userId: userId,
        applicationId: result.applicationId,
        isNew: result.isNew,
      },
      body: rawData,
    };

    await addLog(applicationLog.type, applicationLog.meta, applicationLog.body);

    return res.status(201).json({
      message: API_RESPONSE_MESSAGES.APPLICATION_CREATED_SUCCESS,
      applicationId: result.applicationId,
    });
  } catch (err) {
    if (err instanceof Conflict) {
      return res.boom.conflict(err.message);
    }
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
  try {
    const { applicationId } = req.params;
    const application = await ApplicationModel.getApplicationById(applicationId);

    if (application.notFound) {
      return res.boom.notFound("Application not found");
    }

    return res.json({
      message: "Application returned successfully",
      application,
    });
  } catch (err) {
    logger.error(`Error in getting application by id: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const addIsNewFieldMigration = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const responseData = await ApplicationModel.addIsNewField();
    return res.json({ message: "Applications migration successful", ...responseData });
  } catch (err) {
    logger.error("Error in migration scripts", err);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const nudgeApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { applicationId } = req.params;
    const application = await ApplicationModel.getApplicationById(applicationId);
    if (application.notFound) {
      return res.boom.notFound("Application not found");
    }
    if (req.userData.id !== application.userId) {
      return res.boom.unauthorized("You are not authorized to nudge this application");
    }

    if (application.status !== APPLICATION_STATUS_TYPES.PENDING) {
      return res.boom.badRequest(APPLICATION_ERROR_MESSAGES.APPLICATION_NOT_PENDING);
    }

    const currentTime = Date.now();
    const lastNudgeAt = application.lastNudgeAt;

    // Business requirement: Users can only nudge an application once per 24 hours
    if (lastNudgeAt) {
      const twentyFourHoursInMilliseconds = convertDaysToMilliseconds(1);
      const lastNudgeTimestamp = new Date(lastNudgeAt).getTime();
      const timeDifference = currentTime - lastNudgeTimestamp;

      if (timeDifference <= twentyFourHoursInMilliseconds) {
        return res.boom.tooManyRequests(APPLICATION_ERROR_MESSAGES.NUDGE_TOO_SOON);
      }
    }

    const currentNudgeCount = application.nudgeCount || 0;
    const updatedNudgeCount = currentNudgeCount + 1;
    const newLastNudgeAt = new Date(currentTime).toISOString();

    const updatedData = {
      nudgeCount: updatedNudgeCount,
      lastNudgeAt: newLastNudgeAt,
    };

    await ApplicationModel.updateApplication(updatedData, applicationId);

    return res.json({
      message: API_RESPONSE_MESSAGES.NUDGE_SUCCESS,
      ...updatedData,
    });
  } catch (err) {
    logger.error(`Error while nudging application: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllOrUserApplication,
  addApplication,
  updateApplication,
  getApplicationById,
  addIsNewFieldMigration,
  nudgeApplication,
};
