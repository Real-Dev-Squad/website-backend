const chai = require("chai");
const { expect } = chai;
const { removeDiscordRole } = require("../../../utils/removeDiscordRole");
const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const discordRolesModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const userData = require("../../fixtures/user/user")();
const { groupData, memberGroupData } = require("../../fixtures/discordactions/discordactions");

describe("removeDiscordRole", function () {
  let userId;
  let discordId;
  let roleid;
  let rolename;

  beforeEach(async function () {
    userData[0].roles = { archived: false, in_discord: true };
    userId = await addUser(userData[0]);
    discordId = userData[0].discordId;
    userData[0] = { ...userData[0], id: userId };

    const addRolePromises = memberGroupData.map(async (data) => {
      await memberRoleModel.add(data);
    });
    const discordRolesModelPromise = [discordRolesModel.add(groupData[0]), discordRolesModel.add(groupData[1])];
    await Promise.all(discordRolesModelPromise);
    roleid = groupData[0].roleid;
    rolename = groupData[0].rolename;
    await memberRoleModel.add({ roleid, userid: discordId });
    await Promise.all(addRolePromises);
  });

  afterEach(async function () {
    await cleanDb();
  });

  it("should remove discord role successfully", async function () {
    const isDiscordRoleRemoved = await removeDiscordRole(userData[0], discordId, roleid, rolename);

    expect(isDiscordRoleRemoved.success).to.be.equal(true);
    expect(isDiscordRoleRemoved.message).to.be.equal("Role deleted successfully");
  });

  it("should throw an error if roleid and rolename doesn't exist in database when attempting to remove", async function () {
    roleid = "randomRoleId";
    rolename = "randomRoleName";

    try {
      await removeDiscordRole(userData[0], discordId, roleid, rolename);
    } catch (error) {
      expect(error.message).to.equal("Role doesn't exist");
    }
  });

  it("should throw an error if roleid doesn't exist in database when attempting to remove", async function () {
    roleid = "randomRoleId";
    rolename = undefined;

    try {
      await removeDiscordRole(userData[0], discordId, roleid, rolename);
    } catch (error) {
      expect(error.message).to.equal("Role doesn't exist");
    }
  });

  it("should throw an error if rolename doesn't exist in database when attempting to remove", async function () {
    roleid = undefined;
    rolename = "randomRoleName";

    try {
      await removeDiscordRole(userData[0], discordId, roleid, rolename);
    } catch (error) {
      expect(error.message).to.equal("Role doesn't exist");
    }
  });

  it("should throw an error if rolename and roleid both are undefined", async function () {
    roleid = undefined;
    rolename = undefined;

    try {
      await removeDiscordRole(userData[0], discordId, roleid, rolename);
    } catch (error) {
      expect(error.message).to.equal("Role doesn't exist");
    }
  });

  it("should throw an error if role deletion failed", async function () {
    discordId = "randomDiscordId";

    try {
      await removeDiscordRole(userData[0], discordId, roleid, rolename);
    } catch (error) {
      expect(error.message).to.equal("Role deletion failed");
    }
  });
});
