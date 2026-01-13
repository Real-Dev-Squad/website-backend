import { application, applicationPayload } from "../types/application";
import { Conflict } from "http-errors";
const ApplicationModel = require("../models/applications");
const {
  APPLICATION_STATUS_TYPES,
  APPLICATION_ERROR_MESSAGES,
  APPLICATION_REVIEW_CYCLE_START_DATE,
} = require("../constants/application");
const logger = require("../utils/logger");

interface CreateApplicationServiceParams {
  userId: string;
  payload: applicationPayload;
}

interface CreateApplicationServiceResponse {
  applicationId: string;
  isNew: boolean;
}

const transformPayloadToApplication = (payload: applicationPayload, userId: string): application => {
  const transformed: application = {
    userId,
    biodata: {
      firstName: payload.firstName,
      lastName: payload.lastName,
    },
    location: {
      city: payload.city,
      state: payload.state,
      country: payload.country,
    },
    professional: {
      institution: payload.college,
      skills: payload.skills,
    },
    intro: {
      introduction: payload.introduction,
      funFact: payload.funFact,
      forFun: payload.forFun,
      whyRds: payload.whyRds,
      numberOfHours: payload.numberOfHours,
    },
    foundFrom: payload.foundFrom,
    role: payload.role,
  };

  transformed.imageUrl = payload.imageUrl;

  if (payload.socialLink) {
    transformed.socialLink = payload.socialLink;
  }

  return transformed;
};

/**
 * Service to create application
 * Handles the logic for:
 * - Checking existing applications created after the review cycle start date (business requirement)
 * - Creating new applications if no application found after the review cycle start date
 * - Always creates a new application (no update flow)
 *
 * @param params - Object containing userId and payload
 * @returns Promise resolving to application creation response
 * @throws Conflict if application already exists after the review cycle start date
 */
export const createApplicationService = async (
  params: CreateApplicationServiceParams
): Promise<CreateApplicationServiceResponse> => {
  try {
    const { userId, payload } = params;

    const userApplications = await ApplicationModel.getUserApplications(userId);
    const existingApplication = userApplications.length > 0 ? userApplications[0] : null;

    if (existingApplication) {
      const existingCreatedAt = new Date(existingApplication.createdAt);

      if (existingCreatedAt > APPLICATION_REVIEW_CYCLE_START_DATE) {
        throw new Conflict(APPLICATION_ERROR_MESSAGES.APPLICATION_ALREADY_REVIEWED);
      }
    }

    const createdAt = new Date().toISOString();

    const applicationData: application = {
      ...transformPayloadToApplication(payload, userId),
      score: 0,
      status: APPLICATION_STATUS_TYPES.PENDING,
      createdAt,
      isNew: true,
      nudgeCount: 0,
    };

    const applicationId = await ApplicationModel.addApplication(applicationData);

    return {
      applicationId,
      isNew: true,
    };
  } catch (err) {
    if (err instanceof Conflict) {
      throw err;
    }
    logger.error("Error in createApplicationService", err);
    throw err;
  }
};
