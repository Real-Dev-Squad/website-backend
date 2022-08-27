/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require("../utils/firestore");
const userModel = firestore.collection("users");
const ROLES = require("../constants/roles");
/**
 * Fetches the data about our users
 * @return {Promise<userModel|Array>}
 */

const fetchUsers = async (queryParams = {}) => {
  try {
    const { showArchived } = queryParams;
    const shouldShowArchived = showArchived === "true";

    const query = shouldShowArchived ? userModel : userModel.where(`roles.${ROLES.ARCHIVED}`, "==", false);
    const snapshot = await query.get();

    const allMembers = [];

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const memberData = doc.data();
        const curatedMemberData = {
          id: doc.id,
          ...memberData,
          tokens: undefined,
          phone: undefined,
          email: undefined,
        };
        curatedMemberData.isMember = !!(memberData.roles && memberData.roles.member);
        allMembers.push(curatedMemberData);
      });
    }

    return allMembers;
  } catch (err) {
    logger.error("Error retrieving members data", err);
    throw err;
  }
};

/**
 * changes the role of a new user to member
 * @param userId { String }: User id of user to be modified
 * @return { Object }: whether moveToMember was successful or not and whether user is already a member or not
 */

const moveToMembers = async (userId) => {
  try {
    const userDoc = await userModel.doc(userId).get();
    const user = userDoc.data();
    if (user?.roles?.member) return { isAlreadyMember: true, movedToMember: false };
    const roles = user.roles ? { ...user.roles, member: true } : { member: true };
    await userModel.doc(userId).update({
      roles,
    });
    return { isAlreadyMember: false, movedToMember: true };
  } catch (err) {
    logger.error("Error updating user", err);
    throw err;
  }
};

/**
 * Fetches the data about our users with roles
 * @return {Promise<userModel|Array>}
 */

const fetchUsersWithRole = async (role) => {
  try {
    const snapshot = await userModel.where(`roles.${role}`, "==", true).get();
    const onlyMembers = [];

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        onlyMembers.push({
          id: doc.id,
          ...doc.data(),
          phone: undefined,
          email: undefined,
          tokens: undefined,
        });
      });
    }
    return onlyMembers;
  } catch (err) {
    logger.error("Error retrieving members data with roles of member", err);
    throw err;
  }
};

/**
 * changes the role of a new user to member
 * @param userId { String }: User id of user to be modified
 * @return { Object }: whether moveToMember was successful or not and whether user is already a member or not
 */

const addArchiveRoleToMembers = async (userId) => {
  try {
    const userDoc = await userModel.doc(userId).get();
    const user = userDoc.data();
    if (user?.roles && user.roles[ROLES.ARCHIVED]) return { isArchived: true };
    const roles = { ...user.roles, [ROLES.ARCHIVED]: true };
    await userModel.doc(userId).update({
      roles,
    });
    return { isArchived: false };
  } catch (err) {
    logger.error("Error updating user", err);
    throw err;
  }
};

module.exports = {
  moveToMembers,
  addArchiveRoleToMembers,
  fetchUsers,
  fetchUsersWithRole,
};
