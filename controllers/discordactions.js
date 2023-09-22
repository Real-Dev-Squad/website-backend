const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const admin = require("firebase-admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const discordRolesModel = require("../models/discordactions");
const { setUserDiscordNickname, getDiscordMembers } = require("../services/discordService");
const { getNonNickNameSyncedUsers } = require("../models/users");
const { updateNicknameSynced } = require("../services/users");
const discordDeveloperRoleId = config.get("discordDeveloperRoleId");
const discordMavenRoleId = config.get("discordMavenRoleId");
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

    const membersInDiscord = await getDiscordMembers();
    const usersToBeEffected = [];
    const nickNameToBeSyncedUsers = await getNonNickNameSyncedUsers();
    await Promise.all(
      membersInDiscord.map(async (discordUser) => {
        try {
          const foundUserWithDiscordId = nickNameToBeSyncedUsers.find((user) => user.discordId === discordUser.user.id);
          if (foundUserWithDiscordId) {
            const isDeveloper = discordUser.roles.includes(discordDeveloperRoleId);
            const isMaven = discordUser.roles.includes(discordMavenRoleId);
            const isBot = discordUser.user.bot;
            const isUsernameMatched = discordUser.nick === foundUserWithDiscordId.username.toLowerCase();
            const isSuperuser = foundUserWithDiscordId.roles.super_user;
            if (isDeveloper && !isMaven && !isUsernameMatched && !isBot && !isSuperuser) {
              usersToBeEffected.push({
                discordId: foundUserWithDiscordId.discordId,
                username: foundUserWithDiscordId.username,
                first_name: foundUserWithDiscordId.first_name,
                id: foundUserWithDiscordId.id,
              });
            }
          }
        } catch (error) {
          logger.error(`error getting user with matching discordId ${error.message}`);
        }
      })
    );

    const totalNicknamesUpdated = { count: 0 };
    const totalNicknamesNotUpdated = { count: 0, errors: [] };
    const nickNameUpdatedUsers = [];
    let counter = 0;
    for (let i = 0; i < usersToBeEffected.length; i++) {
      const { discordId, username, first_name: firstName } = usersToBeEffected[i];
      try {
        if (counter % 10 === 0 && counter !== 0) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        if (!discordId) {
          throw new Error("user not verified");
        } else if (!username) {
          throw new Error(`does not have a username`);
        }
        const response = await setUserDiscordNickname(username.toLowerCase(), discordId);
        if (response) {
          const message = await response.message;
          if (message) {
            counter++;
            totalNicknamesUpdated.count++;
            nickNameUpdatedUsers.push(usersToBeEffected[i].id);
          }
        }
      } catch (error) {
        totalNicknamesNotUpdated.count++;
        totalNicknamesNotUpdated.errors.push(`User: ${username ?? firstName}, ${error.message}`);
        logger.error(`Error in updating discord Nickname: ${error}`);
      }
    }
    await updateNicknameSynced(nickNameUpdatedUsers);
    return res.json({
      totalNicknamesUpdated,
      totalNicknamesNotUpdated,
      message: `Users Nicknames updated successfully`,
    });
  } catch (error) {
    logger.error(`Error while updating nicknames: ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Update all user Discord nickname based on status
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */

const updateUsersNicknameStatus = async (req, res) => {
  try {
    const { lastNicknameUpdate = 0 } = req.body;
    const data = await discordRolesModel.updateUsersNicknameStatus(lastNicknameUpdate);
    return res.json({
      message: "Updated discord users nickname based on status",
      data,
    });
  } catch (err) {
    logger.error(`Error while updating users nickname based on status: ${err}`);
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
  updateUsersNicknameStatus,
};
