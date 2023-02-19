const extAccountsModel = require("../models/external-accounts");

const addExternalAccountData = async (req, res) => {
  try {
    await extAccountsModel.addExternalAccountData(req.body);

    return res.status(201).json({ message: "Added external accounts data successfully" });
  } catch (error) {
    logger.error(`Error adding data: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = { addExternalAccountData };
