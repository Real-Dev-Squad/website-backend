/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

const firestore = require('../utils/firestore');
const userModel = firestore.collection('users');

/**
 * Fetches the data about our users
 * @return {Promise<userModel|Array>}
 */

const fetchUsers = async () => {
  try {
    const snapshot = await userModel.get();

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
    logger.error('Error retrieving members data', err);
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
    logger.error('Error updating user', err);
    throw err;
  }
};

/**
 * Migrate user roles
 * @return {Promise<usersMigrated|Object>}
 */
const migrateUsers = async () => {
  try {
    const userSnapShot = await userModel.where('isMember', '==', true).get();
    const migratedUsers = [];

    const usersArr = [];

    userSnapShot.forEach((doc) => usersArr.push({ id: doc.id, ...doc.data() }));

    for (const user of usersArr) {
      const roles = { ...user.roles, member: true };

      await userModel.doc(user.id).set({
        ...user,
        roles,
      });

      migratedUsers.push(user.username);
    }

    return { count: migratedUsers.length, users: migratedUsers };
  } catch (err) {
    logger.error('Error migrating user roles', err);
    throw err;
  }
};

/**
 * Deletes isMember property from user object
 * @return {Promise<usersMigrated|Object>}
 */
const deleteIsMemberProperty = async () => {
  try {
    const userSnapShot = await userModel.where('roles', '!=', false).get();
    const migratedUsers = [];

    const usersArr = [];

    userSnapShot.forEach((doc) => usersArr.push({ id: doc.id, ...doc.data() }));

    for (const user of usersArr) {
      delete user.isMember;

      await userModel.doc(user.id).set({ ...user });

      migratedUsers.push(user.username);
    }

    return { count: migratedUsers.length, users: migratedUsers };
  } catch (err) {
    logger.error('Error deleting isMember property', err);
    throw err;
  }
};

/**
 * Fetches the data about our users with roles
 * @return {Promise<userModel|Array>}
 */

const fetchUsersWithRole = async (role) => {
  try {
    const snapshot = await userModel.where(`roles.${role}`, '==', true).get();
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
    logger.error('Error retrieving members data with roles of member', err);
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
    if (user?.roles?.archivedMember) return { isArchived: true };
    const roles = { ...user.roles, archivedMember: true };
    await userModel.doc(userId).update({
      roles,
    });
    return { isArchived: false };
  } catch (err) {
    logger.error('Error updating user', err);
    throw err;
  }
};

module.exports = {
  moveToMembers,
  addArchiveRoleToMembers,
  fetchUsers,
  migrateUsers,
  deleteIsMemberProperty,
  fetchUsersWithRole,
};
