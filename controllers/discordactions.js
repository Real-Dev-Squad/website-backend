const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const admin = require("firebase-admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const discordRolesModel = require("../models/discordactions");
const { setUserDiscordNickname } = require("../services/discordService");
const dataAccess = require("../services/dataAccessLayer");

/**
 * Creates a role
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

const createGroupRole = async (req, res) => {
  try {
    const rolename = `group-${req.body.rolename}`;

    const { wasSuccess } = await discordRolesModel.isGroupRoleExists(rolename);

    if (!wasSuccess) {
      return res.status(400).json({
        message: "Role already exists!",
      });
    }
    const dataForDiscord = {
      rolename,
      mentionable: true,
    };
    const groupRoleData = {
      rolename,
      createdBy: req.userData.id,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    };
    const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("rdsServerlessBot.ttl"),
    });

    const responseForCreatedRole = await fetch(`${DISCORD_BASE_URL}/roles/create`, {
      method: "PUT",
      body: JSON.stringify(dataForDiscord),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    }).then((response) => response.json());

    groupRoleData.roleid = responseForCreatedRole.id;

    const { id } = await discordRolesModel.createNewRole(groupRoleData);
    return res.status(201).json({
      message: "Role created successfully!",
      id,
    });
  } catch (err) {
    logger.error(`Error while creating new Role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Gets all group-roles
 *
 * @param res {Object} - Express response object
 */

const getAllGroupRoles = async (req, res) => {
  try {
    const { groups } = await discordRolesModel.getAllGroupRoles();
    const dev = req.query.dev === "true";
    if (dev) {
      // Placing the new changes under the feature flag.
      const discordId = req.userData?.discordId;
      const groupsWithMembershipInfo = await discordRolesModel.enrichGroupDataWithMembershipInfo(discordId, groups);
      return res.json({
        message: "Roles fetched successfully!",
        groups: groupsWithMembershipInfo,
      });
    }
    return res.json({
      message: "Roles fetched successfully!",
      groups,
    });
  } catch (err) {
    logger.error(`Error while getting roles: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getGroupsRoleId = async (req, res) => {
  try {
    const { discordId } = req.userData;
    const userGroupRoles = await discordRolesModel.getGroupRolesForUser(discordId);
    return res.json({
      message: "User group roles Id fetched successfully!",
      ...userGroupRoles,
    });
  } catch (error) {
    logger.error(`Error while getting user roles: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};
/**
 * Gets all group-roles
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const addGroupRoleToMember = async (req, res) => {
  try {
    const memberGroupRole = {
      ...req.body,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    };

    const { roleData, wasSuccess } = await discordRolesModel.addGroupRoleToMember(memberGroupRole);

    if (!wasSuccess) {
      return res.status(400).json({
        message: "Role already exists!",
        data: {
          ...roleData,
        },
      });
    }
    const dataForDiscord = {
      ...req.body,
    };
    const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("rdsServerlessBot.ttl"),
    });

    await fetch(`${DISCORD_BASE_URL}/roles/add`, {
      method: "PUT",
      body: JSON.stringify(dataForDiscord),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    }).then((response) => response.json());

    return res.status(201).json({
      message: "Role added successfully!",
    });
  } catch (err) {
    logger.error(`Error while adding new Role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Gets all group-roles
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const updateDiscordImageForVerification = async (req, res) => {
  try {
    const { id: userDiscordId } = req.params;
    const discordAvatarUrl = await discordRolesModel.updateDiscordImageForVerification(userDiscordId);
    return res.json({
      message: "Discord avatar URL updated successfully!",
      discordAvatarUrl,
    });
  } catch (err) {
    logger.error(`Error while updating discord image url verification document: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Set all group-idle on discord
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const setRoleIdleToIdleUsers = async (req, res) => {
  try {
    const result = await discordRolesModel.updateIdleUsersOnDiscord();
    return res.status(201).json({
      message: "All Idle Users updated successfully.",
      ...result,
    });
  } catch (err) {
    logger.error(`Error while setting idle role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Patch Update user nicknames on discord server
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const updateDiscordNicknames = async (req, res) => {
  try {
    const { dev } = req.query;
    if (dev !== "true") {
      return res.status(404).json({
        message: "Users Nicknames not updated",
      });
    }

    const discordServerUsers = await dataAccess.retrieveDiscordUsers();
    const nonSuperUsers = discordServerUsers.filter((user) => !user.roles.super_user);

    const errorsArr = [];
    let successCounter = 0;
    let errorCounter = 0;

    let counter = 0;
    for (let i = 0; i < nonSuperUsers.length; i++) {
      const { discordId, username } = nonSuperUsers[i];
      try {
        if (counter % 10 === 0 && counter !== 0) {
          await new Promise((resolve) => setTimeout(resolve, 4000));
        }
        await setUserDiscordNickname(username, discordId);
        counter++;

        successCounter++;
      } catch (error) {
        errorsArr.push(`User: ${username}, ${error.message}`);
        errorCounter++;
      }
    }

    return res.json({
      errorsArr,
      numberOfUneffectedUsers: errorCounter,
      numberOfUsersEffected: successCounter,
      totalUsersChecked: nonSuperUsers.length,
      message: `Users Nicknames updated successfully`,
    });
  } catch (error) {
    logger.error(`Error while updating nicknames: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getGroupsRoleId,
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  updateDiscordImageForVerification,
  setRoleIdleToIdleUsers,
  updateDiscordNicknames,
};
