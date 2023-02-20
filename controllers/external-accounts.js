const externalAccountsModel = require("../models/external-accounts");

const addExternalAccountData = async (req, res) => {
  const createdOn = Date.now();

  try {
    const data = { ...req.body, createdOn };
    await externalAccountsModel.addExternalAccountData(data);

    return res.status(201).json({ message: "Added external account data successfully" });
  } catch (error) {
    logger.error(`Error adding data: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

const getExternalAccountData = async (req, res) => {
  try {
    const externalAccountData = await externalAccountsModel.fetchExternalAccountData(req.query, req.params.token);
    if (externalAccountData.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const attributes = externalAccountData[0].attributes;

    if (attributes.expiry && attributes.expiry < Date.now()) {
      return res.status(498).json({ message: "Token Expired. Please generate it again" });
    }

    return res.status(200).json({ message: "Data returned successfully", attributes: attributes });
  } catch (error) {
    logger.error(`Error getting external account data: ${error}`);
    return res.boom.serverUnavailable("Something went wrong please contact admin");
  }
};

module.exports = { addExternalAccountData, getExternalAccountData };
