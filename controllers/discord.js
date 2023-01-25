const discordModel = require("../models/discord");

const addDiscordData = async (req, res) => {
  try {
    await discordModel.addDiscordData(req.body);

    return res.status(201).json({ message: "Added discord data successfully" });
  } catch (error) {
    logger.error(`Error adding data: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = { addDiscordData };
