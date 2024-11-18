const chai = require("chai");
const Sinon = require("sinon");
const { expect } = chai;
const { removeDiscordRoleFromUser } = require("../../../utils/removeDiscordRoleFromUser");
const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");
const discordRolesModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const userData = require("../../fixtures/user/user")();
const { groupData, memberGroupData } = require("../../fixtures/discordactions/discordactions");

describe("removeDiscordRoleFromUser", function () {
  let userId;
  let discordId;
  let roleid;
  let fetchStub;

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
    await memberRoleModel.add({ roleid, userid: discordId });
    await Promise.all(addRolePromises);

    fetchStub = Sinon.stub(global, "fetch");
  });

  afterEach(async function () {
    await cleanDb();
    fetchStub.restore();
  });

  it("should remove discord role successfully", async function () {
    fetchStub.returns(
      Promise.resolve({ json: () => Promise.resolve({ success: true, message: "Role deleted successfully" }) })
    );

    const isDiscordRoleRemoved = await removeDiscordRoleFromUser(userData[0], discordId, roleid);

    expect(isDiscordRoleRemoved.success).to.be.equal(true);
    expect(isDiscordRoleRemoved.message).to.be.equal("Role deleted successfully");
  });

  it("should throw an error if role doesn't exist in database when attempting to remove", async function () {
    roleid = "randomRoleId";

    try {
      await removeDiscordRoleFromUser(userData[0], discordId, roleid);
    } catch (error) {
      expect(error.message).to.equal("Role doesn't exist");
    }
  });

  it("should throw an error if role deletion failed", async function () {
    fetchStub.rejects(new Error("Role deletion failed"));

    try {
      await removeDiscordRoleFromUser(userData[0], discordId, roleid);
    } catch (error) {
      expect(error.message).to.equal("Role deletion failed");
    }
  });
});
