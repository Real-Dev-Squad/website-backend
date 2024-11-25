import { CustomRequest, CustomResponse } from "../types/global";
import featureFlagService from "../services/featureFlagService";
import { FeatureFlag, UpdateFeatureFlagRequestBody } from "../types/featureFlags";

export const getAllFeatureFlags = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const serviceResponse = await featureFlagService.getAllFeatureFlags();
    
    if (!serviceResponse) {
      return res.status(500).json({ 
        error: "Failed to fetch feature flags" 
      });
    }

    return res.status(200).json({
      message: "Feature flags retrieved successfully",
      data: serviceResponse
    });

  } catch (err) {
    logger.error(`Error in fetching feature flags: ${err}`);
    return res.boom.badImplementation('Internal server error');
  }
};


export const getFeatureFlagById = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { flagId } = req.params;
    const serviceResponse = await featureFlagService.getFeatureFlagById(flagId);
    
    if (!serviceResponse) {
      return res.status(404).json({ error: "Feature flag not found" });
    }

    return res.status(200).json({
      message: "Feature flag retrieved successfully",
      data: serviceResponse
    });
  } catch (err) {
    logger.error(`Error in fetching feature flag: ${err}`);
    return res.boom.badImplementation('Internal server error');
  }
};

export const createFeatureFlag = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const flagData: Partial<FeatureFlag> = req.body as Partial<FeatureFlag>;

    const serviceResponse = await featureFlagService.createFeatureFlag(flagData);

    if (serviceResponse.data) {
      return res.status(serviceResponse.status).json({
        message: "Feature flag created successfully",
        data: serviceResponse.data,
      });
    } else if (serviceResponse.error) {

      return res.status(serviceResponse.status).json({
        error: serviceResponse.error.message || "Internal server error",
      });
    } else {
      return res.status(500).json({ error: "Unknown error occurred" });
    }
  } catch (err) {
    logger.error(`Unexpected error in creating feature flag: ${err}`);
    return res.boom.badImplementation("Internal server error.");
  }
};


export const updateFeatureFlag = async (req: CustomRequest, res: CustomResponse) => {
  try {
    const { flagId } = req.params;
    console.log("Mehulllll", flagId)
    const updateData: UpdateFeatureFlagRequestBody = {
      Status: req.body.Status,
      UserId: req.body.UserId,
    };

    const serviceResponse = await featureFlagService.updateFeatureFlag(flagId, updateData);

    if (serviceResponse.status >= 400) {
      return res.status(serviceResponse.status).json({
        error: serviceResponse.error?.message || "An error occurred while updating the feature flag",
      });
    }

    return res.status(serviceResponse.status).json({
      message: "Feature flag updated successfully",
      data: serviceResponse.data,
    });
  } catch (err) {
    logger.error(`Error in updating feature flag: ${err}`);
    return res.boom.badImplementation('Internal server error');
  }
};

