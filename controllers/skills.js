const skills = require("../models/skills");
const logger = require("../utils/logger");

/**
 * Award a skill
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
async function awardSkill(req, res) {
  let addedData;

  try {
    const { username } = req.params;
    addedData = await skills.awardSkill(req.body, username);
  } catch (error) {
    logger.error("Error posting skill data: ", error);
    return res.boom.notFound("User doesn't exist");
  }

  return res.json({
    message: "Added data successfully!",
    content: addedData,
  });
}

/**
 * Fetch all skills
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
async function fetchSkills(req, res) {
  let allSkills;

  try {
    allSkills = await skills.fetchSkills();
  } catch (error) {
    logger.error("Error fetching skill data: ", error);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }

  return res.json({
    message: "Skills returned successfully!",
    skills: allSkills.length > 0 ? allSkills : [],
  });
}

module.exports = {
  fetchSkills,
  awardSkill,
};
