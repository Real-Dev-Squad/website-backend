const externalAccountsModel = require("../models/external-accounts");

const addExternalAccountData = async (req, res) => {
  try {
    const createdOn = Date.now();
    const data = { ...req.body, createdOn };

    await externalAccountsModel.addExternalAccountData(data);

    return res.status(201).json({ message: "Added external account data successfully" });
  } catch (error) {
    logger.error(`Error adding data: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = { addExternalAccountData };
