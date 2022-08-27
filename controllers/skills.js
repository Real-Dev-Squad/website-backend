const skills = require("../models/skills");
const logger = require("../utils/logger");

/**
 * Award a skill
 *
 * @param req {Object} - Express request object
 * @param req.body {Object} - User object
 * @param res {Object} - Express response object
 */
async function awardSkill(req, res) {
  try {
    const { username } = req.params;
    const addedData = await skills.awardSkill(req.body, username);
    return res.json({
      message: "Added skill for user successfully!",
      skill: addedData,
    });
  } catch (error) {
    logger.error("Error posting skill data: ", error);
    return res.boom.badRequest(error.message);
  }
}

/**
 * Fetch all skills
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
async function fetchSkills(req, res) {
  try {
    const allSkills = await skills.fetchSkills();

    return res.json({
      message: "Skills returned successfully!",
      skills: allSkills.length > 0 ? allSkills : [],
    });
  } catch (error) {
    logger.error("Error fetching skill data: ", error);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
}

/**
 * Fetch skills of User
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
async function fetchUserSkills(req, res) {
  const { username } = req.params;

  try {
    const userData = await skills.fetchUserSkills(username);
    return res.json({
      message: "Skills returned successfully!",
      skills: userData.length > 0 ? userData : [],
    });
  } catch (error) {
    logger.error("Error fetching user skills: ", error);
    return res.boom.notFound(error.message);
  }
}

module.exports = {
  fetchSkills,
  awardSkill,
  fetchUserSkills,
};
