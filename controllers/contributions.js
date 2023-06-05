const contributionsService = require("../services/contributions");
const { fetchUser } = require("../models/users");
const { SOMETHING_WENT_WRONG } = require("../constants/errorMessages");

/**
 * Get the  contributions of the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

const getUserContributions = async (req, res) => {
  try {
    const username = req.params.username;
    const result = await fetchUser({ username: req.params.username });
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

module.exports = {
  getUserContributions,
};
