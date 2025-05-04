import chai from "chai";
import Sinon from "sinon";
import { logType } from "../../../constants/logs";
import * as discordActions from "../../../models/discordactions";
import { addLog } from "../../../models/logs";
import firestore from "../../../utils/firestore";
import { removeDiscordRoleFromUser } from "../../../utils/removeDiscordRoleFromUser";
import { groupData, memberGroupData } from "../../fixtures/discordactions/discordactions";
import addUser from "../../utils/addUser";
import cleanDb from "../../utils/cleanDb";
const { expect } = chai;
const discordRolesModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const logsModel = firestore.collection("logs");
const userData = require("../../fixtures/user/user")();

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
    await addLog(
      logType.REMOVE_ROLE_FROM_USER_SUCCESS,
      { roleId: roleid, userid: discordId },
      { message: "Role removed successfully from user", userData: userData[0] }
    );

    fetchStub.returns(
      Promise.resolve({ json: () => Promise.resolve({ success: true, message: "Role deleted successfully" }) })
    );

    const isDiscordRoleRemoved = await removeDiscordRoleFromUser(userData[0], discordId, roleid);
    const successLog = await logsModel
      .where("type", "==", logType.REMOVE_ROLE_FROM_USER_SUCCESS)
      .where("meta.roleId", "==", roleid)
      .where("meta.userid", "==", discordId)
      .limit(1)
      .get();

    expect(isDiscordRoleRemoved.success).to.be.equal(true);
    expect(isDiscordRoleRemoved.message).to.be.equal("Role deleted successfully");
    expect(successLog.docs[0].data().body.message).to.be.equal("Role removed successfully from user");
  });

  it("should throw an error if role doesn't exist in database when attempting to remove", async function () {
    roleid = "randomRoleId";

    const isDiscordRoleRemoved = await removeDiscordRoleFromUser(userData[0], discordId, roleid);
    const failedLog = await logsModel
      .where("type", "==", logType.REMOVE_ROLE_FROM_USER_FAILED)
      .where("meta.roleId", "==", roleid)
      .limit(1)
      .get();

    expect(isDiscordRoleRemoved.success).to.be.equal(false);
    expect(isDiscordRoleRemoved.message).to.be.equal("Role doesn't exist");
    expect(failedLog.docs[0].data().body.message).to.be.equal("Role doesn't exist");
  });

  it("should throw an error if role deletion from discord failed", async function () {
    fetchStub.rejects(new Error("Role deletion from discord failed"));

    const isDiscordRoleRemoved = await removeDiscordRoleFromUser(userData[0], discordId, roleid);
    const failedLog = await logsModel
      .where("type", "==", logType.REMOVE_ROLE_FROM_USER_FAILED)
      .where("meta.roleId", "==", roleid)
      .where("meta.userid", "==", discordId)
      .limit(1)
      .get();

    expect(isDiscordRoleRemoved.success).to.be.equal(false);
    expect(isDiscordRoleRemoved.message).to.be.equal("Role deletion from discord failed");
    expect(failedLog.docs[0].data().body.message).to.be.equal("Role deletion from discord failed");
  });

  it("should throw an error if role deleted from discord but not from database", async function () {
    fetchStub.returns(Promise.resolve({ json: () => Promise.resolve({ success: true }) }));

    const removeMemberGroupStub = Sinon.stub(discordActions, "removeMemberGroup").resolves({
      roleId: roleid,
      wasSuccess: false,
    });

    const isDiscordRoleRemoved = await removeDiscordRoleFromUser(userData[0], discordId, roleid);
    const failedLog = await logsModel
      .where("type", "==", logType.REMOVE_ROLE_FROM_USER_FAILED)
      .where("meta.roleId", "==", roleid)
      .where("meta.userid", "==", discordId)
      .limit(1)
      .get();

    expect(isDiscordRoleRemoved.success).to.be.equal(false);
    expect(isDiscordRoleRemoved.message).to.be.equal("Role deletion from database failed");
    expect(failedLog.docs[0].data().body.message).to.be.equal("Role deletion from database failed");

    removeMemberGroupStub.restore();
  });
});
