import { addLog } from "../models/logs";
const { logType } = require("../constants/logs");
import { CustomRequest, CustomResponse } from "../types/global";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const ApplicationModel = require("../models/applications");
const { API_RESPONSE_MESSAGES, APPLICATION_REVIEW_SYSTEM_PROMPT } = require("../constants/application");
const { getUserApplicationObject } = require("../utils/application");
const admin = require("firebase-admin");
const logger = require("../utils/logger");
const config = require("config");
const { generateObject } = require("ai");
const { google } = require("@ai-sdk/google");
const joiToJsonSchema = require("joi-to-json-schema");
const { applicationReviewSchema } = require("../middlewares/validators/application");

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

const generateReview = async (
  introduction: string,
  whyRds: string,
  forFun: string,
  funFact: string
): Promise<any> => {
  try {
    const apiKey = config.get("googleGenerativeAiApiKey");
    if (!apiKey) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
    }

    const jsonSchema = joiToJsonSchema(applicationReviewSchema);
    const userPrompt = `Please review the following application:
      Introduction:
      ${introduction}

      Why RDS:
      ${whyRds}

      Hobbies/Interests (forFun):
      ${forFun}

      Fun Fact:
      ${funFact}

      Provide a comprehensive review based on the evaluation criteria.`;

    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite", {
        apiKey: apiKey,
      }),
      schema: jsonSchema,
      system: APPLICATION_REVIEW_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    const { error, value } = applicationReviewSchema.validate(object);

    if (error) {
      throw new Error(`AI output validation failed: ${error.details[0].message}`);
    }

    return value;
  } catch (err) {
    logger.error(`Error in generating review: ${err}`);
    throw err;
  }
};

const reviewApplication = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { applicationId } = req.body;
    const application = await ApplicationModel.getApplicationById(applicationId);

    if (application.notFound) {
      return res.boom.notFound("Application not found");
    }

    const { introduction, whyRds, forFun, funFact } = application.intro;

    if (!introduction || !whyRds || !forFun || !funFact) {
      return res.boom.badRequest("Application is missing required fields for review");
    }

    const review = await generateReview(introduction, whyRds, forFun, funFact);

    return res.json({
      message: "Application review generated successfully",
      review,
    });
  } catch (err) {
    logger.error(`Error in reviewing application: ${err}`);
    if (err.message && err.message.includes("not found")) {
      return res.boom.notFound(err.message);
    }
    if (err.message && err.message.includes("missing required")) {
      return res.boom.badRequest(err.message);
    }
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getAllOrUserApplication,
  addApplication,
  updateApplication,
  getApplicationById,
  reviewApplication,
};
