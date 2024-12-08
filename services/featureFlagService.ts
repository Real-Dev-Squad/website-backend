import config from "config";
import { FeatureFlagResponse, FeatureFlagService } from "../types/featureFlags";

const FEATURE_FLAG_BASE_URL = config.get<string>("services.featureFlag.baseUrl");
const FEATURE_FLAG_API_KEY = config.get<string>("services.featureFlag.apiKey");

const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    "x-api-key": FEATURE_FLAG_API_KEY,
};

const getAllFeatureFlags = async (): Promise<FeatureFlagResponse> => {
  try {
    const response = await fetch(`${FEATURE_FLAG_BASE_URL}/feature-flags`, {
      method: "GET",
        headers: defaultHeaders,
    });

    if (!response.ok) {
      logger.error(`Failed to fetch feature flags. Status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

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
            headers: defaultHeaders,
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

const getFeatureFlagById = async (flagId: string): Promise<{ status: number; data?: any; error?: any }> => {
    try {
        const response = await fetch(`${FEATURE_FLAG_BASE_URL}/feature-flags/${flagId}`, {
            method: "GET",
            headers: defaultHeaders,
        });
        const status = response.status;
        const responseText = await response.text();

        if (response.ok) {
            try {
                const parsedData = JSON.parse(responseText);
                return { 
                    status,
                    data: parsedData
                };
            } catch (parseError) {
                logger.error("Error parsing success response:", parseError);
                return {
                    status: 500,
                    error: { message: "Error parsing service response" }
                };
            }
        }
        return { 
            status,
            error: { message: responseText }
        };
    } catch (err) {
        logger.error("Error in getFeatureFlagById service:", err);
        return { 
            status: 500, 
            error: { 
                message: err instanceof Error ? err.message : "Internal error while connecting to the feature flag service" 
            } 
        };
    }
};

const featureFlagService: FeatureFlagService = {
  getAllFeatureFlags,
  createFeatureFlag,
  getFeatureFlagById,
};

export default featureFlagService; 