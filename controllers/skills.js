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
      data: userData,
    });
  } catch (error) {
    logger.error("Error fetching user skills: ", error);
    return res.boom.notFound("User doesn't exist");
  }
}

/**
 * Fetch users with given skill
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
async function userWithSkill(req, res) {
  let { skill } = req.params;
  // In case user makes query with - or _ for multiple words
  const regex = /[-_]/g;
  // replace those chars with whitespace
  skill = regex.test(skill) ? skill.replace(regex, " ") : skill;
  let filteredData;

  try {
    filteredData = await skills.userWithSkill(skill);

    if (filteredData.length) {
      return res.json({
        message: "Users returned successfully!",
        data: filteredData,
      });
    } else throw new Error();
  } catch (error) {
    logger.error("Error fetching user with skill: ", error);
    return res.boom.notFound("Invalid Skill. Please re-check input data");
  }
}

module.exports = {
  fetchSkills,
  awardSkill,
  fetchUserSkills,
  userWithSkill,
};
