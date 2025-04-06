import { logType } from "../constants/logs.js";
import type { Request, Response } from "express";
import { INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";
import { 
  getAllApplications,
  getUserApplications,
  addApplication,
  updateApplication,
  getApplicationsBasedOnStatus,
  getApplicationById
} from "../models/applications.js";
import { API_RESPONSE_MESSAGES } from "../constants/application.js";
import admin from "firebase-admin";
import logger from "../utils/logger.js";
import { addLog } from "../services/logService.js";

interface CustomRequest extends Request {
  user?: {
    uid: string;
  };
}

interface CustomResponse extends Response {}

const getAllOrUserApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { limit = 10, lastDocId, status } = req.query;
    const userId = req.user?.uid;

    if (status) {
      const { applications, lastDocId: lastApplicationId, totalCount } = await getApplicationsBasedOnStatus(
        status as string,
        Number(limit),
        lastDocId as string | undefined,
        userId
      );

      return res.status(200).json({
        message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
        applications,
        lastDocId: lastApplicationId,
        totalCount,
      });
    }

    const { applications, lastDocId: lastApplicationId } = await getAllApplications(Number(limit), lastDocId as string);

    return res.status(200).json({
      message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
      applications,
      lastDocId: lastApplicationId,
    });
  } catch (err) {
    logger.error("Error while fetching applications", err);
    return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

const addNewApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { uid: userId } = req.user!;
    const applicationData = {
      ...req.body,
      userId,
      status: "PENDING",
      createdAt: admin.firestore.Timestamp.now(),
    };

    const applicationId = await addApplication(applicationData);

    await addLog(
      logType.APPLICATION_ADDED,
      { applicationId, userId },
      applicationData
    );

    return res.status(201).json({
      message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
      applicationId,
    });
  } catch (err) {
    logger.error("Error while adding application", err);
    return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

const updateApplicationStatus = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const { uid: userId } = req.user!;

    await updateApplication({ status }, applicationId);

    await addLog(
      logType.APPLICATION_UPDATED,
      { applicationId, status, userId },
      { status }
    );

    return res.status(200).json({
      message: API_RESPONSE_MESSAGES.APPLICATION_RETURN_SUCCESS,
    });
  } catch (err) {
    logger.error("Error while updating application", err);
    return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

export {
  getAllOrUserApplication,
  addNewApplication,
  updateApplicationStatus,
};
