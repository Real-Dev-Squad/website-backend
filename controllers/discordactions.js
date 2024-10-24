const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const admin = require("firebase-admin");
const config = require("config");
const jwt = require("jsonwebtoken");
const discordRolesModel = require("../models/discordactions");
const discordServices = require("../services/discordService");
const { fetchAllUsers, fetchUser } = require("../models/users");
const { generateCloudFlareHeaders } = require("../utils/discord-actions");
const discordDeveloperRoleId = config.get("discordDeveloperRoleId");
const discordMavenRoleId = config.get("discordMavenRoleId");
const crypto = require("crypto");

const { setUserDiscordNickname, getDiscordMembers } = discordServices;

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

    const { roleExists } = await discordRolesModel.isGroupRoleExists({ rolename });

    if (roleExists) {
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
      description: req.body.description || "",
      date: admin.firestore.Timestamp.fromDate(new Date()),
    };

    const headers = generateCloudFlareHeaders(req.userData);

    const responseForCreatedRole = await fetch(`${DISCORD_BASE_URL}/roles/create`, {
      method: "PUT",
      body: JSON.stringify(dataForDiscord),
      headers,
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
    const discordId = req.userData?.discordId;
    const groupsWithMembershipInfo = await discordRolesModel.enrichGroupDataWithMembershipInfo(discordId, groups);
    return res.json({
      message: "Roles fetched successfully!",
      groups: groupsWithMembershipInfo,
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
    const roleExistsPromise = discordRolesModel.isGroupRoleExists({
      roleid: memberGroupRole.roleid,
    });
    const userDataPromise = fetchUser({ discordId: memberGroupRole.userid });
    const [{ roleExists, existingRoles }, userData] = await Promise.all([roleExistsPromise, userDataPromise]);

    if (!roleExists || req.userData.id !== userData.user.id) {
      return res.boom.forbidden("Permission denied. Cannot add the role.");
    }

    if (existingRoles.docs.length > 0) {
      const roleDetails = existingRoles.docs[0].data();
      if (roleDetails.rolename && !roleDetails.rolename.startsWith("group-")) {
        return res.boom.forbidden("Cannot use rolename that is not a group role");
      }
    }

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
    const headers = generateCloudFlareHeaders(req.userData);

    const apiCallToDiscord = fetch(`${DISCORD_BASE_URL}/roles/add`, {
      method: "PUT",
      body: JSON.stringify(dataForDiscord),
      headers,
    });
    const discordLastJoinedDateUpdate = discordRolesModel.groupUpdateLastJoinDate({
      id: existingRoles.docs[0].id,
    });
    await Promise.all([apiCallToDiscord, discordLastJoinedDateUpdate]);

    return res.status(201).json({
      message: "Role added successfully!",
    });
  } catch (err) {
    logger.error(`Error while adding new Role: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const deleteRole = async (req, res) => {
  try {
    const { roleid, userid } = req.body;

    const roleExistsPromise = discordRolesModel.isGroupRoleExists({
      roleid,
    });
    const userDataPromise = fetchUser({ discordId: userid });
    const [{ roleExists }, userData] = await Promise.all([roleExistsPromise, userDataPromise]);

    if (!roleExists || req.userData.id !== userData.user.id) {
      return res.boom.forbidden("Permission denied. Cannot delete the role.");
    }
    await discordServices.removeRoleFromUser(roleid, userid, req.userData);

    const { wasSuccess } = await discordRolesModel.removeMemberGroup(roleid, userid);
    if (wasSuccess) {
      return res.status(200).json({ message: "Role deleted successfully" });
    } else {
      return res.status(400).json({ message: "Role deletion failed" });
    }
  } catch (error) {
    logger.error(`Error while deleting role: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
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
    const { dev } = req.query;
    const result = await discordRolesModel.updateIdleUsersOnDiscord(dev);
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
 * Set all group-idle-7d+ on discord
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const setRoleIdle7DToIdleUsers = async (req, res) => {
  try {
    const { dev } = req.query;
    const result = await discordRolesModel.updateIdle7dUsersOnDiscord(dev);
    return res.status(201).json({
      message: "All Idle 7d+ Users updated successfully.",
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
    const membersInDiscord = await getDiscordMembers();
    const usersInDB = await fetchAllUsers();
    const usersToBeEffected = [];
    await Promise.all(
      membersInDiscord.map(async (discordUser) => {
        try {
          const foundUserWithDiscordId = usersInDB.find((user) => user.discordId === discordUser.user.id);
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
          await new Promise((resolve) => setTimeout(resolve, 5500));
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

const syncDiscordGroupRolesInFirestore = async (req, res) => {
  try {
    const discordRoles = await discordServices.getDiscordRoles();
    if (discordRoles.status === 500) {
      return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
    }
    const batch = discordRoles.roles.map(async (role) => {
      const data = await discordRolesModel.getGroupRoleByName(role.name);

      if (!data.data.empty) {
        const roleInFirestore = {
          id: data.data.docs[0].id,
          ...data.data.docs[0].data(),
        };
        if (roleInFirestore.roleid !== role.id) {
          await discordRolesModel.updateGroupRole(
            {
              roleid: role.id,
            },
            roleInFirestore.id
          );
        }
      } else {
        await discordRolesModel.createNewRole({
          createdBy: req.userData.id,
          rolename: role.name,
          roleid: role.id,
          date: admin.firestore.Timestamp.fromDate(new Date()),
        });
      }
    });
    await Promise.all(batch);

    const allRolesInFirestore = await discordRolesModel.getAllGroupRoles();

    return res.json({
      response: allRolesInFirestore.groups,
      message: `Discord groups synced with firestore successfully`,
    });
  } catch (error) {
    logger.error(`Error while updating discord groups ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

/**
 * Set role group-onboarding-31d+
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const setRoleToUsersWith31DaysPlusOnboarding = async (req, res) => {
  try {
    const result = await discordRolesModel.updateUsersWith31DaysPlusOnboarding();
    return res.status(201).json({
      message: "All Users with 31 Days Plus Onboarding are updated successfully.",
      ...result,
    });
  } catch (error) {
    logger.error(`Error while setting group-onboarding-31d+ role : ${error}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const generateRandomId = () => {
  return crypto.randomBytes(16).toString("hex");
};

const generateInviteForUser = async (req, res) => {
  try {
    const { userId, dev } = req.query;
    const userIdForInvite = userId || req.userData.id;
    let inviteLink = "";
    let randomId = "";

    if (!dev) {
      const modelResponse = await discordRolesModel.getUserDiscordInvite(userIdForInvite);
      if (!modelResponse.notFound) {
        return res.status(409).json({
          message: "User invite is already present!",
        });
      }
    } else {
      const modelResponse = await discordRolesModel.getUserDiscordInvite(userIdForInvite);
      if (!modelResponse.notFound) {
        // Generate a random ID
        randomId = generateRandomId();
      }
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
    });
    const discordInviteResponse = await response.json();

    const inviteCode = discordInviteResponse.data.code;
    inviteLink = `discord.gg/${inviteCode}`;

    if (dev) {
      const purpose = req.body.purpose;
      await discordRolesModel.addInviteToInviteModel({ userId: randomId || userIdForInvite, inviteLink, purpose });

      return res.status(201).json({
        message: "invite generated successfully",
        inviteLink,
        purpose,
        userId,
      });
    } else {
      await discordRolesModel.addInviteToInviteModel({ userId: userIdForInvite, inviteLink });

      return res.status(201).json({
        message: "invite generated successfully",
        inviteLink,
        userId,
      });
    }
  } catch (err) {
    logger.error(`Error in generating invite for user: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

const getUserDiscordInvite = async (req, res) => {
  try {
    const { userId } = req.query;
    const isSuperUser = req.userData.roles.super_user;

    if (userId && !isSuperUser) return res.boom.forbidden("User should be super user to get link for other users");

    const userIdForInvite = userId || req.userData.id;

    const invite = await discordRolesModel.getUserDiscordInvite(userIdForInvite);

    if (invite.notFound) {
      return res.boom.notFound("User invite doesn't exist");
    }

    return res.json({
      message: "Invite returned successfully",
      inviteLink: invite?.inviteLink,
    });
  } catch (err) {
    logger.error(`Error in fetching user invite: ${err}`);
    return res.boom.badImplementation(INTERNAL_SERVER_ERROR);
  }
};

module.exports = {
  getGroupsRoleId,
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  deleteRole,
  updateDiscordImageForVerification,
  setRoleIdleToIdleUsers,
  setRoleIdle7DToIdleUsers,
  updateDiscordNicknames,
  updateUsersNicknameStatus,
  syncDiscordGroupRolesInFirestore,
  setRoleToUsersWith31DaysPlusOnboarding,
  getUserDiscordInvite,
  generateInviteForUser,
};
