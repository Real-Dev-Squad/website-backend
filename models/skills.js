const firestore = require("../utils/firestore");
const skillsModel = firestore.collection("skills");
const users = require("./users");

/**
 * Award a Skill
 *
 * @param skillData { Object }:  Skill data object to be stored in DB
 * @param userName  { String }:   Username of user to fetch their details.
 * @return {Promise<skill|Object>}
 */
async function awardSkill(skillData, userName) {
  try {
    const skillSnapshot = await skillsModel.add(skillData);
    const userInfo = await users.fetchUser({ username: userName });

    const addedData = await skillSnapshot.get();
    const { name } = addedData.data();
    const data = userInfo.user.skills?.length ? { skills: [...userInfo.user.skills, name] } : { skills: [name] };

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
    logger.error("Error getting skills", error);
    throw error;
  }
}

/**
 * Fetch Skills of User
 *
 * @param userName { String }: Username of user to fetch their details
 * @return {Promise<skills|Array>}
 */
async function fetchUserSkills(userName) {
  try {
    const { user } = await users.fetchUser({ username: userName });

    if (user.id == null) throw Error();
    else return user.skills;
  } catch (error) {
    logger.error("Error getting skills of user", error);
    throw error;
  }
}

module.exports = {
  fetchSkills,
  awardSkill,
  fetchUserSkills,
};
