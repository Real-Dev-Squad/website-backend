import contributionsService from "../services/contributions.js";
import { SOMETHING_WENT_WRONG } from "../constants/errorMessages.js";
import { retrieveUsers } from "../services/dataAccessLayer.js";
import logger from "../utils/logger.js";

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

export const getUserContributions = async (req, res) => {
  try {
    const { username } = req.params;
    const result = await retrieveUsers({ username: req.params.username });
    if (result.userExists) {
      const contributions = await contributionsService.getUserContributions(username);
      return res.json(contributions);
    }
    return res.boom.notFound("User doesn't exist");
  } catch (err) {
    logger.error(`Error while retriving contributions ${err}`);
    return res.boom.badImplementation(SOMETHING_WENT_WRONG);
  }
};
