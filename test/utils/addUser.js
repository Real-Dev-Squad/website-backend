const users = require("../../models/users");

// Import fixtures
const userData = require("../fixtures/user/user")();

/**
 * File to be required in every test file where userId is required to generate the JWT
 *
 * @return {string} userId - userId for the added user
 */
module.exports = async (user) => {
  const isValid = user && Object.keys(user).length !== 0 && user.constructor === Object;
  // Use the user data sent as arguments, else use data from fixtures
  user = isValid ? user : userData[0];
  /*
    Making a shallow copy of user allows us to safely modify the user object
    without affecting the original fixture
  */
  const userWithoutRoles = { ...user };
  const rolesToBeAdded = userWithoutRoles.roles;
  // A new user to be added in the DB should not have any roles
  delete userWithoutRoles.roles;
  const { userId } = await users.addOrUpdate(userWithoutRoles);

  if (rolesToBeAdded) {
    const persistedUser = (await users.fetchUser({ userId })).user;
    const existingRoles = persistedUser.roles;
    const rolesToBeUpdated = { ...existingRoles, ...rolesToBeAdded };
    await users.addOrUpdate({ roles: rolesToBeUpdated }, userId);
  }
  return userId;
};
