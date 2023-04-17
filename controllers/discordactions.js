const DiscordActionsModel = require("../models/discordactions");
const admin = require("firebase-admin");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

/**
 * Creates a level
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const createRole = async (req, res) => {
  try {
    const { id, roleData } = await DiscordActionsModel.addLevel({
      ...req.body,
      createdBy: req.userData.id,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    });
    return res.json({
      message: "Role created successfully!",
      data: {
        level: roleData,
        id,
      },
    });
  } catch (err) {
    logger.error(`Error while creating new level: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createRole,
};
