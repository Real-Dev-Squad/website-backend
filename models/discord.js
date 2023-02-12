const firestore = require("../utils/firestore");
const discordModel = firestore.collection("discord");

const addDiscordData = async (data) => {
  try {
    await discordModel.add(data);
    return { message: "Added data successfully" };
  } catch (err) {
    logger.error("Error in adding data", err);
    throw err;
  }
};

module.exports = { addDiscordData };
