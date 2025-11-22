import { addLog } from "../models/logs";
const { logType } = require("../constants/logs");
import { CustomRequest, CustomResponse } from "../types/global";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const ApplicationModel = require("../models/applications");
const { API_RESPONSE_MESSAGES } = require("../constants/application");
const { getUserApplicationObject } = require("../utils/application");
const admin = require("firebase-admin");

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
    const { applications } = await ApplicationModel.getApplicationsBasedOnStatus("pending", 1, "", req.userData.id);
    if (applications.length) {
      return res.status(409).json({
        message: "User application is already present!",
      });
    }
    const createdAt = new Date().toISOString();
    const data = getUserApplicationObject(rawData, req.userData.id, createdAt);

    const applicationLog = {
      type: logType.APPLICATION_ADDED,
      meta: {
        username: req.userData.username,
        userId: req.userData.id,
      },
      body: data,
    };

    const promises = [
      ApplicationModel.addApplication(data),
      addLog(applicationLog.type, applicationLog.meta, applicationLog.body),
    ];

    await Promise.all(promises);

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
    const devFeatureFlag = req?.query?.dev === "true";
    const { applicationId } = req.params;
    const rawBody = req.body;

    const updatePayload = devFeatureFlag
      ? {
          status: rawBody.status,
          adminFeedback: admin.firestore.FieldValue.arrayUnion({
            status: rawBody.status,
            ...(rawBody.feedback !== undefined && { feedback: rawBody.feedback }),
            createdAt: admin.firestore.Timestamp.now(),
          }),
        }
      : rawBody;
    const applicationLog = {
      type: logType.APPLICATION_UPDATED,
      meta: {
        applicationId,
        username: req.userData.username,
        userId: req.userData.id,
      },
      body: updatePayload,
    };

    const promises = [
      ApplicationModel.updateApplication(updatePayload, applicationId),
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

module.exports = {
  getAllOrUserApplication,
  addApplication,
  updateApplication,
  getApplicationById,
};
