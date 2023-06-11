const externalAccountsModel = require("../models/external-accounts");
const { SOMETHING_WENT_WRONG, INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { getDiscordMembers } = require("../services/discordService");
const { getDiscordUsers, addOrUpdate } = require("../models/users");
const logger = require("../utils/logger");

const addExternalAccountData = async (req, res) => {
  const createdOn = Date.now();

  try {
    const data = { ...req.body, createdOn };

    // Check if token already exists
    const dataFound = await externalAccountsModel.fetchExternalAccountData("", data.token);
    if (dataFound.token && dataFound.token === data.token) {
      return res.boom.conflict("Token already exists");
    }

    await externalAccountsModel.addExternalAccountData(data);

    return res.status(201).json({ message: "Added external account data successfully" });
  } catch (error) {
    logger.error(`Error adding data: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

const getExternalAccountData = async (req, res) => {
  try {
    const externalAccountData = await externalAccountsModel.fetchExternalAccountData(req.query, req.params.token);
    if (!externalAccountData.id) {
      return res.boom.notFound("No data found");
    }

    const attributes = externalAccountData.attributes;
    if (attributes.expiry && attributes.expiry < Date.now()) {
      return res.boom.unauthorized("Token Expired. Please generate it again");
    }

    return res.status(200).json({ message: "Data returned successfully", attributes: attributes });
  } catch (error) {
    logger.error(`Error getting external account data: ${error}`);
    return res.boom.serverUnavailable(SOMETHING_WENT_WRONG);
  }
};

/**
 * Gets all group-roles
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const syncExternalAccountData = async (req, res) => {
  try {
    const [discordUserData, rdsUserData] = await Promise.all([getDiscordMembers(), getDiscordUsers()]);
    const rdsUserDataMap = {};
    const userDataUpdatorPromises = [];

    rdsUserData.forEach((rdsUser) => {
      rdsUserDataMap[rdsUser.discordId] = {
        id: rdsUser.id,
        roles: rdsUser.roles,
      };
    });

    discordUserData.forEach((discordUser) => {
      const mappedRdsUser = rdsUserDataMap[discordUser.user.id];
      if (mappedRdsUser) {
        const userData = {
          discordJoinedAt: discordUser.joined_at,
          roles: {
            ...mappedRdsUser.roles,
            in_discord: true,
          },
        };
        userDataUpdatorPromises.push(addOrUpdate(userData, mappedRdsUser.id));
      }
    });

    await Promise.all(userDataUpdatorPromises);

    return res.json({
      rdsUsers: rdsUserData.length,
      discordUsers: discordUserData.length,
      message: "Data Sync Complete",
    });
  } catch (err) {
    logger.error("Error in syncing users discord joined at", err);
    return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

module.exports = { addExternalAccountData, getExternalAccountData, syncExternalAccountData };
