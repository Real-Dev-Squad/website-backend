const firestore = require("../utils/firestore");
const { fetchAllUsers } = require("../models/users");
const { generateAuthTokenForCloudflare, generateCloudFlareHeaders } = require("../utils/discord-actions");
const userModel = firestore.collection("users");
const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const getDiscordMembers = async () => {
  const authToken = await generateAuthTokenForCloudflare();
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

const getDiscordRoles = async () => {
  const authToken = await generateAuthTokenForCloudflare();
  try {
    const response = await (
      await fetch(`${DISCORD_BASE_URL}/roles`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      })
    ).json();
    return response;
  } catch (err) {
    logger.error("Error in fetching the discord data", err);
    return {
      status: 500,
      message: "Something went wrong",
    };
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
      updated_at: Date.now(),
    };
    updateUsersPromises.push(userModel.doc(id).update(userData));
  });
  await Promise.all(updateUsersPromises);
};

const addRoleToUser = async (userid, roleid) => {
  const authToken = generateAuthTokenForCloudflare();
  const data = await fetch(`${DISCORD_BASE_URL}/roles/add`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    body: JSON.stringify({ userid, roleid }),
  });
  const response = await data.json();
  return response;
};

const removeRoleFromUser = async (roleId, discordId, userData) => {
  try {
    const headers = generateCloudFlareHeaders(userData);
    const data = await fetch(`${DISCORD_BASE_URL}/roles`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ userid: discordId, roleid: roleId }),
    });
    const response = await data.json();
    return response;
  } catch (err) {
    logger.error("Error in consuming remove role service", err);
    throw new Error(err);
  }
};

const setUserDiscordNickname = async (userName, discordId) => {
  try {
    const authToken = generateAuthTokenForCloudflare();

    const response = await (
      await fetch(`${DISCORD_BASE_URL}/guild/member`, {
        method: "PATCH",
        body: JSON.stringify({ userName, discordId }),
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      })
    ).json();
    return {
      userEffected: userName,
      message: response,
    };
  } catch (err) {
    logger.error("Error in updating discord Nickname", err);
    throw err;
  }
};

module.exports = {
  getDiscordMembers,
  getDiscordRoles,
  setInDiscordFalseScript,
  addRoleToUser,
  removeRoleFromUser,
  setUserDiscordNickname,
};
