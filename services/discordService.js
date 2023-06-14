const jwt = require("jsonwebtoken");
const { fetchAllUsers, addOrUpdate } = require("../models/users");

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
    const userData = {
      ...user,
      roles: {
        in_discord: false,
      },
    };
    updateUsersPromises.push(addOrUpdate(userData, user.id));
  });
  await Promise.all(updateUsersPromises);
};

module.exports = {
  getDiscordMembers,
  setInDiscordFalseScript,
};
