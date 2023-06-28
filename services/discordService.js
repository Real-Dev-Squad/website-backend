const firestore = require("../utils/firestore");
const { fetchAllUsers } = require("../models/users");
const { generateAuthTokenForCloudflare } = require("../utils/discord-actions");
const userModel = firestore.collection("users");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const getDiscordMembers = async () => {
  const authToken = generateAuthTokenForCloudflare();
  try {
    const response = await (
      await fetch(`${DISCORD_BASE_URL}/discord-members`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      })
    ).json();
    return response;
  } catch (err) {
    logger.error("Error in fetching the discord data", err);
    throw err;
  }
};

const setInDiscordFalseScript = async () => {
  const users = await fetchAllUsers();
  const updateUsersPromises = [];
  users.forEach((user) => {
    const id = user.id;
    // eslint-disable-next-line security/detect-object-injection
    delete user[id];
    const userData = {
      ...user,
      roles: {
        ...user.roles,
        in_discord: false,
      },
    };
    updateUsersPromises.push(userModel.doc(id).update(userData));
  });
  await Promise.all(updateUsersPromises);
};

const addRoleToUser = async (userid, roleid) => {
  const authToken = await generateAuthTokenForCloudflare();
  const data = await fetch(`${DISCORD_BASE_URL}/roles/add`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ userid, roleid }),
  });
  const response = await data.json();
  return response;
};

const removeRoleFromUser = async (roleId, discordId) => {
  try {
    const authToken = await generateAuthTokenForCloudflare();
    const data = await fetch(`${DISCORD_BASE_URL}/roles`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ userid: discordId, roleid: roleId }),
    });
    const response = await data.json();
    return response;
  } catch (err) {
    logger.error("Error in consuming remove role service", err);
    throw new Error(err);
  }
};

module.exports = {
  getDiscordMembers,
  setInDiscordFalseScript,
  addRoleToUser,
  removeRoleFromUser,
};
