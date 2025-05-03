import { SOMETHING_WENT_WRONG } from "../constants/errorMessages.js";
import artsQuery from "../models/arts.js";
import logger from "../utils/logger.js";

/**
 * Adds art
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

export const addArt = async (req, res, next) => {
  try {
    const artData = req.body;
    const art = await artsQuery.addArt(artData);
    return res.json(art);
  } catch (error) {
    logger.error("Error in addArt: ", error);
    return next(SOMETHING_WENT_WRONG);
  }
};

/**
 * Fetches all arts irrespective of user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
export const getArts = async (req, res, next) => {
  try {
    const arts = await artsQuery.fetchArts();
    return res.json(arts);
  } catch (error) {
    logger.error("Error in getArts: ", error);
    return next(SOMETHING_WENT_WRONG);
  }
};

/**
 * Fetches all the arts of the user
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
export const getUserArts = async (req, res, next) => {
  try {
    const arts = await artsQuery.fetchUserArts(req.userData.id);
    return res.json(arts);
  } catch (error) {
    logger.error("Error in getUserArts: ", error);
    return next(SOMETHING_WENT_WRONG);
  }
};
