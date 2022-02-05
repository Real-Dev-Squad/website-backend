/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'firestore'... Remove this comment to see the full error message
const firestore = require('../utils/firestore')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userModel'... Remove this comment to see the full error message
const userModel = firestore.collection('users')

/**
 * Fetches the data about our users
 * @return {Promise<userModel|Array>}
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUsers... Remove this comment to see the full error message
const fetchUsers = async () => {
  try {
    const snapshot = await userModel.get()

    const allMembers: any = []

    if (!snapshot.empty) {
      snapshot.forEach((doc: any) => {
        const memberData = doc.data()
        const curatedMemberData = {
          id: doc.id,
          ...memberData,
          tokens: undefined,
          phone: undefined,
          email: undefined
        }
        curatedMemberData.isMember = !!(memberData.roles && memberData.roles.member)
        allMembers.push(curatedMemberData)
      })
    }

    return allMembers
  } catch (err) {
    logger.error('Error retrieving members data', err)
    throw err
  }
}

/**
 * changes the role of a new user to member
 * @param userId { String }: User id of user to be modified
 * @return { Object }: whether moveToMember was successful or not and whether user is already a member or not
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moveToMemb... Remove this comment to see the full error message
const moveToMembers = async (userId: any) => {
  try {
    const userDoc = await userModel.doc(userId).get()
    const user = userDoc.data()
    if (user?.roles?.member) return { isAlreadyMember: true, movedToMember: false }
    const roles = user.roles ? { ...user.roles, member: true } : { member: true }
    await userModel.doc(userId).update({
      roles
    })
    return { isAlreadyMember: false, movedToMember: true }
  } catch (err) {
    logger.error('Error updating user', err)
    throw err
  }
}

/**
 * Migrate user roles
 * @return {Promise<usersMigrated|Object>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'migrateUse... Remove this comment to see the full error message
const migrateUsers = async () => {
  try {
    const userSnapShot = await userModel.where('isMember', '==', true).get()
    const migratedUsers = []

    const usersArr: any = []

    userSnapShot.forEach((doc: any) => usersArr.push({ id: doc.id, ...doc.data() }))

    for (const user of usersArr) {
      const roles = { ...user.roles, member: true }

      await userModel.doc(user.id).set({
        ...user,
        roles
      })

      migratedUsers.push(user.username)
    }

    return { count: migratedUsers.length, users: migratedUsers }
  } catch (err) {
    logger.error('Error migrating user roles', err)
    throw err
  }
}

/**
 * Deletes isMember property from user object
 * @return {Promise<usersMigrated|Object>}
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'deleteIsMe... Remove this comment to see the full error message
const deleteIsMemberProperty = async () => {
  try {
    const userSnapShot = await userModel.where('roles', '!=', false).get()
    const migratedUsers = []

    const usersArr: any = []

    userSnapShot.forEach((doc: any) => usersArr.push({ id: doc.id, ...doc.data() }))

    for (const user of usersArr) {
      delete user.isMember

      await userModel.doc(user.id).set({ ...user })

      migratedUsers.push(user.username)
    }

    return { count: migratedUsers.length, users: migratedUsers }
  } catch (err) {
    logger.error('Error deleting isMember property', err)
    throw err
  }
}

/**
 * Fetches the data about our users with roles
 * @return {Promise<userModel|Array>}
 */

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'fetchUsers... Remove this comment to see the full error message
const fetchUsersWithRole = async (role: any) => {
  try {
    const snapshot = await userModel.where(`roles.${role}`, '==', true).get()
    const onlyMembers: any = []

    if (!snapshot.empty) {
      snapshot.forEach((doc: any) => {
        onlyMembers.push({
          id: doc.id,
          ...doc.data(),
          phone: undefined,
          email: undefined,
          tokens: undefined
        })
      })
    }
    return onlyMembers
  } catch (err) {
    logger.error('Error retrieving members data with roles of member', err)
    throw err
  }
}

// @ts-expect-error ts-migrate(2580) FIXME: Cannot find name 'module'. Do you need to install ... Remove this comment to see the full error message
module.exports = {
  moveToMembers,
  fetchUsers,
  migrateUsers,
  deleteIsMemberProperty,
  fetchUsersWithRole
}
