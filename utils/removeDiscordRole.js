/*
  This function handles all scenarios for role arguments - only "roleid" / only "rolename" / both.
  Ensure that if only "roleid" is provided, pass "rolename" as "undefined", and vice versa.
  When both "roleid" and "rolename" are available, pass both as arguments.
  For implementation reference, see linkExternalAccount in controllers/external-accounts.js."
 */

const discordRolesModel = require("../models/discordactions");
const discordServices = require("../services/discordService");

const removeDiscordRole = async (userData, discordId, roleid, rolename) => {
  try {
    const role = await discordRolesModel.isGroupRoleExists({ roleid, rolename });

    if (!role.roleExists) {
      throw new Error("Role doesn't exist");
    }

    const roleData = role.existingRoles.docs[0].data();

    await discordServices.removeRoleFromUser(roleData.roleid, discordId, userData);

    const { wasSuccess } = await discordRolesModel.removeMemberGroup(roleData.roleid, discordId);
    if (!wasSuccess) {
      throw new Error("Role deletion failed");
    }

    return true;
  } catch (error) {
    logger.error(`Error removing role ${rolename || roleid} for user ${discordId}: ${error.message}`);

    return false;
  }
};

module.exports = { removeDiscordRole };
