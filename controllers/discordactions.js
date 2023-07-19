const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const admin = require("firebase-admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const discordRolesModel = require("../models/discordactions");
const { retrieveUsers } = require("../services/dataAccessLayer");

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
    const groupsWithMemberCount = await discordRolesModel.getNumberOfMemberForGroups(groups);
    const groupCreatorIds = groupsWithMemberCount.reduce((ids, group) => {
      ids.add(group.createdBy);
      return ids;
    }, new Set());
    const groupCreatorsDetails = await retrieveUsers({ userIds: Array.from(groupCreatorIds) });
    const groupsWithUserDetails = groupsWithMemberCount.map((group) => {
      return {
        ...group,
        firstName: groupCreatorsDetails[group.createdBy].first_name,
        lastName: groupCreatorsDetails[group.createdBy].last_name,
        image: groupCreatorsDetails[group.createdBy].picture?.url,
      };
    });

    return res.json({
      message: "Roles fetched successfully!",
      groups: groupsWithUserDetails,
    });
  } catch (err) {
    logger.error(`Error while getting roles: ${err}`);
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

module.exports = {
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  updateDiscordImageForVerification,
};
