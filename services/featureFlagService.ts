import config from "config";
import { FeatureFlag, FeatureFlagResponse, FeatureFlagService } from "../types/featureFlags";

const FEATURE_FLAG_BASE_URL = config.get<string>("services.featureFlag.baseUrl");
const FEATURE_FLAG_API_KEY = config.get<string>("services.featureFlag.apiKey");

const generateHeaders = (): HeadersInit => {
  return {
    "Content-Type": "application/json",
    "x-api-key": `${FEATURE_FLAG_API_KEY}`,
  };
};

const getAllFeatureFlags = async (): Promise<FeatureFlagResponse> => {
  try {
    const response = await fetch(`${FEATURE_FLAG_BASE_URL}/feature-flags`, {
      method: "GET",
      headers: generateHeaders(),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    logger.error("Error in fetching feature flags", err);
      return { status: 500, error: { message: "Internal error while connecting to the feature flag service" } };
  }
};

const createFeatureFlag = async (flagData: any): Promise<{ status: number; data?: any; error?: any }> => {
    try {
        const response = await fetch(`${FEATURE_FLAG_BASE_URL}/feature-flags`, {
            method: "POST",
            headers: generateHeaders(),
            body: JSON.stringify(flagData),
        });
        const status = response.status;

        if (response.ok) {
            const data = await response.json().catch(() => ({
                message: "Feature flag created successfully",
            }));
            return { status, data };
        } else {
            const error = await response.json().catch(() => ({
                message: "An error occurred while creating the feature flag",
            }));
            return { status, error };
        }
    } catch (err) {
        logger.error("Error in createFeatureFlag service:", err);
        return { status: 500, error: { message: "Internal error while connecting to the feature flag service" } };
    }
};


const updateFeatureFlag = async (
  flagId: string, 
  updateData: Partial<FeatureFlag>
): Promise<FeatureFlagResponse> => {
  try {
    const response = await fetch(`${FEATURE_FLAG_BASE_URL}/feature-flags/${flagId}`, {
      method: "PUT",
      headers: generateHeaders(),
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    logger.error("Error in updating feature flag", err);
    throw err;
  }
};

const featureFlagService: FeatureFlagService = {
  getAllFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
};

export default featureFlagService; 