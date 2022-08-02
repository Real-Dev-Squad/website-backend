const firestore = require("../utils/firestore");
const skillsModel = firestore.collection("skills");
const users = require("./users");

/**
 * Award a Skill
 *
 * @param skillData {Object}:  Skill data object to be stored in DB
 * @param userName   String:   Username of user to fetch their details.
 * @return {Promise<skill|Object>}
 */
async function awardSkill(skillData, userName) {
  try {
    const skillSnapshot = await skillsModel.add(skillData);
    const userInfo = await users.fetchUser({ username: userName });

    const addedData = await skillSnapshot.get();
    const data = userInfo.user.skills?.length
      ? { skills: [...userInfo.user.skills, addedData.id] }
      : { skills: [addedData.id] };

    await users.addOrUpdate(data, userInfo.user.id);
    return addedData.data();
  } catch (error) {
    logger.error("Error posting skill data", error);
    throw error;
  }
}

/**
 * Fetch all Skills
 *
 * @return {Promise<skills|Array>}
 */
async function fetchSkills() {
  try {
    const skillsSnapshot = await skillsModel.get();
    const skills = skillsSnapshot.docs.map((skill) => {
      return {
        id: skill.id,
        ...skill.data(),
      };
    });
    return skills;
  } catch (error) {
    logger.error("error getting tasks", error);
    throw error;
  }
}

module.exports = {
  fetchSkills,
  awardSkill,
};
