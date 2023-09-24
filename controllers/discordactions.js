const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const admin = require("firebase-admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const discordActionModel = require("../models/discordactions");

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

    const { wasSuccess } = await discordActionModel.isGroupRoleExists(rolename);

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

    const { id } = await discordActionModel.createNewRole(groupRoleData);
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
    const { groups } = await discordActionModel.getAllGroupRoles();
    const dev = req.query.dev === "true";
    if (dev) {
      // Placing the new changes under the feature flag.
      const discordId = req.userData?.discordId;
      const groupsWithMembershipInfo = await discordActionModel.enrichGroupDataWithMembershipInfo(discordId, groups);
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

/**
 * Gets all group-roles
 * @param req {Object} - Epxpress request object
 * @param res {Object} - Express response object
 */

const addGroupRoleToMember = async (req, res) => {
  try {
    const memberGroupRole = {
      ...req.body,
      date: admin.firestore.Timestamp.fromDate(new Date()),
    };

    const { roleData, wasSuccess } = await discordActionModel.addGroupRoleToMember(memberGroupRole);

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
    const discordAvatarUrl = await discordActionModel.updateDiscordImageForVerification(userDiscordId);
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
    const result = await discordActionModel.updateIdleUsersOnDiscord();
    return res.status(201).json({
      message: "All Idle Users updated successfully.",
      ...result,
    });
  } catch (err) {
    logger.error(`Error while setting idle role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const generateInviteForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    const userIdForInvite = userId || req.userData.id;

    const modelResponse = await discordActionModel.getUserDiscordInvite(userIdForInvite);

    if (!modelResponse.notFound) {
      return res.status(409).json({
        message: "User invite is already present!",
      });
    }

    const channelId = config.get("discordNewComersChannelId");
    const authToken = jwt.sign({}, config.get("rdsServerlessBot.rdsServerLessPrivateKey"), {
      algorithm: "RS256",
      expiresIn: config.get("rdsServerlessBot.ttl"),
    });

    const inviteOptions = {
      channelId: channelId,
    };
    const response = await fetch(`${DISCORD_BASE_URL}/invite`, {
      method: "POST",
      body: JSON.stringify(inviteOptions),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
    }).then((response) => response.json());

    const inviteCode = response.data.code;
    const inviteLink = `discord.gg/${inviteCode}`;

    await discordActionModel.addInviteToInviteModel({ userId: userIdForInvite, inviteLink });

    return res.json({
      message: "invite generated successfully",
      inviteLink,
    });
  } catch (err) {
    logger.error(`Error in generating invite for user: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getUserDiscordInvite = async (req, res) => {
  try {
    const { userId } = req.query;
    const userIdForInvite = userId || req.userData.id;

    const modelResponse = await discordActionModel.getUserDiscordInvite(userIdForInvite);

    if (modelResponse.notFound) {
      return res.boom.notFound("User invite doesn't exist");
    }

    return res.json({
      message: "Invite returned successfully",
      modelResponse,
    });
  } catch (err) {
    logger.error(`Error in fetching user invite: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  updateDiscordImageForVerification,
  setRoleIdleToIdleUsers,
  getUserDiscordInvite,
  generateInviteForUser,
};
