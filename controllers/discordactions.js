const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const admin = require("firebase-admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const discordRolesModel = require("../models/discordactions");

/**
 * Creates a role
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const createGroupRole = async (req, res) => {
  try {
    const rolename = `group-${req.body.rolename}`;
    const dataForDiscord = {
      rolename,
      mentionable: true,
    };
    const dataForModel = {
      rolename,
      createdBy: req.userData.id,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    };
    const authToken = jwt.sign({}, config.get("botToken.botPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("userToken.ttl"),
    });

    const { id, roleData, wasSuccess } = await discordRolesModel.addNewRole(dataForModel);

    if (!wasSuccess) {
      return res.json({
        message: "Role already exists!",
        data: {
          ...roleData,
        },
      });
    }

    const BASE_URL = "https://94b6-103-75-161-222.ngrok.io";
    const responseForCreatedRole = await fetch(`${BASE_URL}/create-guild-role`, {
      method: "PUT",
      body: JSON.stringify(dataForDiscord),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    }).then((response) => response.json());

    return res.json({
      message: "Role created successfully!",
      responseForCreatedRole,
      data: {
        id,
        ...roleData,
      },
    });
  } catch (err) {
    logger.error(`Error while creating new Role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Creates a role
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const getAllGroupRoles = async (req, res) => {
  try {
    const { groups } = await discordRolesModel.getAllGroupRoles();
    return res.json({
      message: "Role fetched successfully!",
      groups,
    });
  } catch (err) {
    logger.error(`Error while getting roles: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createGroupRole,
  getAllGroupRoles,
};
