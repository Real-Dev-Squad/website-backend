const jwt = require("jsonwebtoken");

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const getDiscordMembers = async (req, res) => {
  const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
    algorithm: "RS256",
    expiresIn: config.get("rdsServerlessBot.ttl"),
  });

  try {
    const response = await fetch(`${DISCORD_BASE_URL}/discord-members`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    })
      .then((response, err) => {
        return response.json();
      })
      .then((data) => {
        return data;
      });
    return response;
  } catch (err) {
    return [{ message: "Oops an internal error occured" }];
  }
};

module.exports = {
  getDiscordMembers,
};
