const jwt = require("jsonwebtoken");
const firestore = require("../utils/firestore");
const { fetchAllUsers } = require("../models/users");
const userModel = firestore.collection("users");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const getDiscordMembers = async () => {
  let authToken;
  const expiry = config.get("rdsServerlessBot.ttl");
  const privateKey = config.get("rdsServerlessBot.rdsServerLessPrivateKey");
  try {
    authToken = jwt.sign({}, privateKey, {
      algorithm: "RS256",
      expiresIn: expiry,
    });
  } catch (err) {
    logger.error("Error in generating auth token", err);
    throw err;
  }

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

const generateAuthTokenForCloudflare = async () => {
  const expiry = config.get("rdsServerlessBot.ttl");
  const privateKey = config.get("rdsServerlessBot.rdsServerLessPrivateKey");
  const authToken = await jwt.sign({}, privateKey, {
    algorithm: "RS256",
    expiresIn: expiry,
  });
  return authToken;
};

const addRoleToUser = async (userid, roleid) => {
  const authToken = await generateAuthTokenForCloudflare();
  const response = await (
    await fetch(`${DISCORD_BASE_URL}/roles/add`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ userid, roleid }),
    })
  ).json();
  return response;
};

module.exports = {
  getDiscordMembers,
  setInDiscordFalseScript,
  addRoleToUser,
  generateAuthTokenForCloudflare,
};
