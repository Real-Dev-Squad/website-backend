import { application, applicationPayload } from "../types/application";
import { Conflict } from "http-errors";
const ApplicationModel = require("../models/applications");
const { APPLICATION_STATUS_TYPES, APPLICATION_ERROR_MESSAGES } = require("../constants/application");
const logger = require("../utils/logger");

interface CreateApplicationServiceParams {
  userId: string;
  payload: applicationPayload;
}

interface CreateApplicationServiceResponse {
  applicationId: string;
  isNew: boolean;
  migratedAt?: Date;
}

const transformPayloadToApplication = (payload: applicationPayload, userId: string): Partial<application> => {
  return {
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
    imageUrl: payload.imageUrl,
    socialLink: payload.socialLink,
  };
};

/**
 * Service to create or update application
 * Handles the logic for:
 * - Checking existing applications
 * - Creating new or updating existing pending applications
 * - Calculating scores
 *
 * @param params - Object containing userId and payload
 * @returns Promise resolving to application creation/update response
 * @throws Conflict if application already reviewed (accepted/rejected)
 */
export const createApplicationService = async (
  params: CreateApplicationServiceParams
): Promise<CreateApplicationServiceResponse> => {
  try {
    const { userId, payload } = params;

    const existingApplication = await ApplicationModel.getApplicationByUserId(userId);

    if (existingApplication) {
      const januaryFirst2026 = "2026-01-01T00:00:00.000Z";

      if (existingApplication.createdAt && existingApplication.createdAt > januaryFirst2026) {
        throw new Conflict(APPLICATION_ERROR_MESSAGES.APPLICATION_ALREADY_REVIEWED);
      }

      if (existingApplication.status === APPLICATION_STATUS_TYPES.PENDING) {
        const migratedAt = new Date();
        const updatedAt = migratedAt.toISOString();

        const updateData = {
          ...transformPayloadToApplication(payload, userId),
          score: 0,
          migratedAt: updatedAt,
          updatedAt,
          isNew: true,
          status: APPLICATION_STATUS_TYPES.PENDING,
        };

        await ApplicationModel.updateApplication(updateData, existingApplication.id);

        return {
          applicationId: existingApplication.id,
          isNew: true,
          migratedAt,
        };
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
    } as application;

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
