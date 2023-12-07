const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const firestore = require("../../../utils/firestore");
const photoVerificationModel = firestore.collection("photo-verification");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const userModel = firestore.collection("users");
const admin = require("firebase-admin");
const ROLES = require("../../../constants/roles");
const {
  createNewRole,
  getAllGroupRoles,
  isGroupRoleExists,
  addGroupRoleToMember,
  deleteRoleFromDatabase,
  updateDiscordImageForVerification,
  enrichGroupDataWithMembershipInfo,
  fetchGroupToUserMapping,
  updateUsersNicknameStatus,
  addInviteToInviteModel,
  getUserDiscordInvite,
} = require("../../../models/discordactions");
const { groupData, roleData, existingRole, memberGroupData } = require("../../fixtures/discordactions/discordactions");
const cleanDb = require("../../utils/cleanDb");
const { userPhotoVerificationData } = require("../../fixtures/user/photo-verification");
const userData = require("../../fixtures/user/user")();
const userStatusModel = firestore.collection("usersStatus");
const { getStatusData } = require("../../fixtures/userStatus/userStatus");
const usersStatusData = getStatusData();
const dataAccessLayer = require("../../../services/dataAccessLayer");
const { ONE_DAY_IN_MS } = require("../../../constants/users");

chai.should();

describe("discordactions", function () {
  describe("createGroupRoles", function () {
    let addStub;

    beforeEach(function () {
      addStub = sinon.stub(discordRoleModel, "add").resolves({ id: "test-id" });
    });

    afterEach(function () {
      addStub.restore();
    });

    it("should create a new role in the database", async function () {
      const roleData = { name: "Test Role" };
      const result = await createNewRole(roleData);
      expect(result).to.deep.equal({ id: result.id, roleData });
    });

    it("should throw an error if creating role fails", async function () {
      const roleData = { name: "Test Role" };
      addStub.rejects(new Error("Database error"));
      return createNewRole(roleData).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("getAllGroupRoles", function () {
    let getStub;

    beforeEach(function () {
      getStub = sinon.stub(discordRoleModel, "get").resolves({
        forEach: (callback) => groupData.forEach(callback),
      });
    });

    afterEach(function () {
      getStub.restore();
    });

    it("should return all group-roles from the database", async function () {
      const result = await getAllGroupRoles();
      expect(result.groups).to.be.an("array");
    });

    it("should throw an error if getting group-roles fails", async function () {
      getStub.rejects(new Error("Database error"));
      return getAllGroupRoles().catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("isGroupRoleExists", function () {
    let roleid;
    let rolename;
    beforeEach(async function () {
      const discordRoleModelPromise = [discordRoleModel.add(groupData[0]), discordRoleModel.add(groupData[1])];
      roleid = groupData[0].roleid;
      rolename = groupData[0].rolename;
      await Promise.all(discordRoleModelPromise);
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should return false if rolename doesn't exist in the database", async function () {
      const rolename = "Test Role";
      const result = await isGroupRoleExists({ rolename });
      expect(result.roleExists).to.equal(false);
    });
    it("should return false if roleid doesn't exist in the database", async function () {
      const roleid = "Test Role";
      const result = await isGroupRoleExists({ roleid });
      expect(result.roleExists).to.equal(false);
    });
    it("should return true if roleid exist in the database", async function () {
      const result = await isGroupRoleExists({ roleid });
      expect(result.roleExists).to.equal(true);
    });
    it("should return true if rolename exist in the database", async function () {
      const result = await isGroupRoleExists({ rolename });
      expect(result.roleExists).to.equal(true);
    });
    it("should return true if rolename and roleid exists in the database", async function () {
      const result = await isGroupRoleExists({ rolename, roleid });
      expect(result.roleExists).to.equal(true);
    });
    it("should return false if either rolename and roleid does not exist in the database", async function () {
      const rolenameResult = await isGroupRoleExists({ rolename: "adf", roleid });
      expect(rolenameResult.roleExists).to.equal(false);
      const roleIdResult = await isGroupRoleExists({ rolename, roleid: "abc44" });
      expect(roleIdResult.roleExists).to.equal(false);
    });
    it("should throw an error if rolename and roleid are not passed", async function () {
      return isGroupRoleExists({}).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Either rolename or roleId is required");
      });
    });
    it("should throw an error if getting group-roles fails", async function () {
      sinon.stub(discordRoleModel, "where").rejects(new Error("Database error"));
      const rolename = "Test Role";

      return isGroupRoleExists({ rolename }).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("addGroupRoleToMember", function () {
    let getStub, addStub;

    beforeEach(function () {
      getStub = sinon.stub(memberRoleModel, "where");
      addStub = sinon.stub(memberRoleModel, "add");
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should add role to member and return success", async function () {
      getStub.resolves({
        empty: true,
      });
      addStub.resolves();

      const result = await addGroupRoleToMember(roleData);

      expect(result.wasSuccess).to.equal(true);
      expect(result.roleData).to.deep.equal(roleData);
    });

    it("should return existing role if user already has the role", async function () {
      const callbackFunction = (role) => {
        existingRole.roleData = role.data();
      };

      getStub.returns({
        limit: sinon.stub().resolves({
          empty: false,
          forEach: callbackFunction,
        }),
      });
      const result = await addGroupRoleToMember(roleData);
      delete result.id;

      expect(result).to.deep.equal(existingRole);
    });

    it("should throw an error if adding role fails", async function () {
      const error = new Error("Database error");
      getStub.resolves({
        empty: true,
      });
      addStub.rejects(error);

      return addGroupRoleToMember(roleData).catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      });
    });
  });

  describe("deleteRoleFromMember", function () {
    let deleteStub;

    beforeEach(async function () {
      const addRolePromises = memberGroupData.map(async (data) => {
        await memberRoleModel.add(data);
      });

      await Promise.all(addRolePromises);

      deleteStub = sinon.stub();
      sinon.stub(memberRoleModel, "doc").returns({
        delete: deleteStub.resolves(),
      });
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should delete role from backend and return success", async function () {
      const roleId = "1234";
      const discordId = "12356";

      const result = await deleteRoleFromDatabase(roleId, discordId);
      expect(result.wasSuccess).to.equal(true);
      expect(result.roleId).to.deep.equal(roleId);
    });

    it("should return failure if no matching role is found", async function () {
      const roleId = "non-existing-role-id";
      const discordId = "12356";

      const result = await deleteRoleFromDatabase(roleId, discordId);

      expect(result.wasSuccess).to.equal(false);
      expect(result.roleId).to.deep.equal(roleId);
    });

    it("should throw an error if deleting role fails", async function () {
      const roleId = "1234";
      const discordId = "12356";

      deleteStub.rejects(new Error("Database error"));

      try {
        await deleteRoleFromDatabase(roleId, discordId);
      } catch (err) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Database error");
      }
    });
  });

  describe("updateDiscordImageForVerification", function () {
    let fetchStub;
    beforeEach(async function () {
      fetchStub = sinon.stub(global, "fetch");
      const docRefUser0 = photoVerificationModel.doc();
      await docRefUser0.set(userPhotoVerificationData);
    });
    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should update the user's discord image for verification", async function () {
      const userDiscordId = "12345";
      const discordAvatarUrl = "https://cdn.discordapp.com/avatars/12345/12345.png";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ user: { avatar: 12345 } }),
        })
      );

      const result = await updateDiscordImageForVerification(userDiscordId);
      expect(result).to.equal(discordAvatarUrl);
    });

    it("should throw an error if no user verification record is found", async function () {
      const userDiscordId = "1234567890";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ user: { avatar: 12345 } }),
        })
      );

      try {
        await updateDiscordImageForVerification(userDiscordId);
      } catch (err) {
        expect(err.message).to.equal("No user verification record found");
      }
    });
    it("should log and rethrow an error if an error occurs during the process", async function () {
      const userDiscordId = "12345";
      const error = new Error("Test error");

      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ user: { avatar: 12345 } }),
        })
      );
      sinon.stub(logger, "error");

      try {
        await updateDiscordImageForVerification(userDiscordId);
      } catch (err) {
        expect(err).to.equal(error);
        expect(logger.error.calledOnce).to.be.equal(true);
        expect(logger.error.calledWith("Error in adding role", error)).to.be.equal(true);
      }
    });
  });

  describe("enrichGroupDataWithMembershipInfo", function () {
    let newGroupData;
    let allIds = [];

    before(async function () {
      const addUsersPromises = userData.map((user) => userModel.add({ ...user }));
      const responses = await Promise.all(addUsersPromises);
      allIds = responses.map((response) => response.id);
      newGroupData = groupData.map((group, index) => {
        return {
          ...group,
          createdBy: allIds[Math.min(index, allIds.length - 1)],
        };
      });

      const addRolesPromises = [
        discordRoleModel.add(newGroupData[0]),
        discordRoleModel.add(newGroupData[1]),
        discordRoleModel.add(newGroupData[2]),
      ];
      await Promise.all(addRolesPromises);

      const addGroupRolesPromises = [
        addGroupRoleToMember({ roleid: newGroupData[0].roleid, userid: userData[0].discordId }),
        addGroupRoleToMember({ roleid: newGroupData[0].roleid, userid: userData[1].discordId }),
        addGroupRoleToMember({ roleid: newGroupData[1].roleid, userid: userData[0].discordId }),
      ];
      await Promise.all(addGroupRolesPromises);
    });

    after(async function () {
      await cleanDb();
    });

    it("should return an empty array if the parameter is an empty array", async function () {
      const result = await enrichGroupDataWithMembershipInfo(userData[0].discordId, []);
      expect(result).to.be.an("array");
      expect(result.length).to.equal(0);
    });

    it("should return an empty array if the parameter no parameter is passed", async function () {
      const result = await enrichGroupDataWithMembershipInfo();
      expect(result).to.be.an("array");
      expect(result.length).to.equal(0);
    });

    it("should return group details with memberCount details ", async function () {
      const result = await enrichGroupDataWithMembershipInfo(userData[0].discordId, newGroupData);
      expect(result[0]).to.deep.equal({
        ...newGroupData[0],
        memberCount: 2,
        firstName: userData[0].first_name,
        lastName: userData[0].last_name,
        image: userData[0].picture.url,
        isMember: true,
      });

      expect(result[1]).to.deep.equal({
        ...newGroupData[1],
        memberCount: 1,
        firstName: userData[1].first_name,
        lastName: userData[1].last_name,
        image: userData[1].picture.url,
        isMember: true,
      });

      expect(result[2]).to.deep.equal({
        ...newGroupData[2],
        memberCount: 0,
        firstName: userData[2].first_name,
        lastName: userData[2].last_name,
        image: userData[2].picture.url,
        isMember: false,
      });
    });
  });

  describe("fetchGroupToMemberMapping", function () {
    const roleIds = [];
    before(async function () {
      // Add 50 different roles and user mapping
      const addGroupRolesPromises = Array.from({ length: 65 }).map((_, index) => {
        const roleId = `role-id-${index}`;
        roleIds.push(roleId);
        return addGroupRoleToMember({
          roleid: roleId,
          userid: index,
          date: admin.firestore.Timestamp.fromDate(new Date()),
        });
      });
      await Promise.all(addGroupRolesPromises);
    });

    after(async function () {
      await cleanDb();
    });

    it("should return empty array for empty roleId", async function () {
      const groupToMemberMappings = await fetchGroupToUserMapping([]);
      expect(groupToMemberMappings).to.be.an("array");
      expect(groupToMemberMappings).to.have.lengthOf(0);
    });

    it("should be able to fetch mapping for less than 30 roleIds", async function () {
      const groupToMemberMappings = await fetchGroupToUserMapping(roleIds.slice(0, 25));
      expect(groupToMemberMappings).to.be.an("array");
      expect(groupToMemberMappings).to.have.lengthOf(25);
    });

    it("should be able to fetch mapping for more than 30 roleIds", async function () {
      const groupToMemberMappings = await fetchGroupToUserMapping(roleIds);
      expect(groupToMemberMappings).to.be.an("array");
      expect(groupToMemberMappings).to.have.lengthOf(65);
    });
  });

  describe("updateUsersNicknameStatus", function () {
    let length;
    let users = [];

    let addedUers = [];
    let addedUsersStatus = [];
    let fetchStub, dataAccessLayerStub;

    beforeEach(async function () {
      fetchStub = sinon.stub(global, "fetch");
      dataAccessLayerStub = sinon.stub(dataAccessLayer, "retrieveUsers");

      addedUers.forEach(({ username, discordId, id }) => {
        dataAccessLayerStub.withArgs(sinon.match({ id })).resolves({
          user: {
            username,
            discordId,
          },
        });
      });
    });

    afterEach(async function () {
      fetchStub.restore();
      dataAccessLayerStub.restore();
    });

    before(async function () {
      length = usersStatusData.length;
      users = userData
        .filter((data) => data.username && data.discordId && !data?.roles[ROLES.ARCHIVED] && data?.discordJoinedAt)
        .slice(0, length);
      const addedUersPromise = users.map(async (user) => {
        const { id } = await userModel.add({ ...user });
        return { ...user, id };
      });

      addedUers = await Promise.all(addedUersPromise);

      const addedUsersStatusPromise = usersStatusData.map(async (data, index) => {
        const { id } = addedUers[index];
        const statusData = { ...data, userId: id };
        const { id: userStatusId } = await userStatusModel.add(statusData);
        return { ...statusData, id: userStatusId };
      });

      addedUsersStatus = await Promise.all(addedUsersStatusPromise);
    });

    after(async function () {
      await cleanDb();
    });

    const getTotalUsers = (timestamp) => {
      const currentUsersStatus = addedUsersStatus.filter((data) => data.currentStatus.updatedAt >= timestamp);

      let futureUsersStatus = addedUsersStatus.filter((data) => data.futureStatus.updatedAt >= timestamp);

      futureUsersStatus = futureUsersStatus.filter(({ id }) => !currentUsersStatus.find((data) => data.id === id));

      return currentUsersStatus.length + futureUsersStatus.length;
    };

    it("should return response successfully when user's nickname have been changed", async function () {
      const fetchStubResponse = "User nickname changed successfully";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(fetchStubResponse),
        })
      );

      const lastTimestamp = Date.now() - ONE_DAY_IN_MS * 3;
      const length = getTotalUsers(lastTimestamp);
      const responseObj = {
        totalUsersStatus: length,
        successfulNicknameUpdates: length,
        unsuccessfulNicknameUpdates: 0,
      };

      const response = await updateUsersNicknameStatus(lastTimestamp);
      expect(response).to.be.an("object");
      expect(response).to.be.deep.equal(responseObj);
    }).timeout(10000);

    it("should return response with 1 failed update when one of the complete user data is not found", async function () {
      dataAccessLayerStub
        .withArgs(sinon.match({ id: addedUers[0].id }))
        .rejects("Error occurred while retrieving data");

      const fetchStubResponse = "User nickname changed successfully";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(fetchStubResponse),
        })
      );

      const lastTimestamp = Date.now() - ONE_DAY_IN_MS * 3;

      try {
        await updateUsersNicknameStatus(lastTimestamp);
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
      }
    }).timeout(10000);

    it("should return response with 1 failed update when one of the user data retrieval fails", async function () {
      dataAccessLayerStub
        .withArgs(sinon.match({ id: addedUers[1].id }))
        .rejects("Error occurred while retrieving data");

      const fetchStubResponse = "User nickname changed successfully";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(fetchStubResponse),
        })
      );

      const lastTimestamp = Date.now() - ONE_DAY_IN_MS * 3;

      try {
        await updateUsersNicknameStatus(lastTimestamp);
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
      }
    }).timeout(10000);

    it("should return response with all failed updates when the fetch call from the discord service to update nickname fails", async function () {
      const fetchStubResponse = "Error in updating discord Nickname";
      fetchStub.throws(new Error(fetchStubResponse));

      const lastTimestamp = Date.now() - ONE_DAY_IN_MS * 3;

      try {
        await updateUsersNicknameStatus(lastTimestamp);
      } catch (err) {
        expect(err).to.be.instanceOf(Error);
      }
    }).timeout(10000);
  });

  describe("addInviteToInviteModel", function () {
    it("should add invite in the invite model for user", async function () {
      const inviteObject = { userId: "kfjkasdfl", inviteLink: "discord.gg/xyz" };
      const inviteId = await addInviteToInviteModel(inviteObject);
      expect(inviteId).to.exist; // eslint-disable-line no-unused-expressions
    });
  });

  describe("getUserDiscordInvite", function () {
    before(async function () {
      const inviteObject = { userId: "kfjkasdfl", inviteLink: "discord.gg/xyz" };
      await addInviteToInviteModel(inviteObject);
    });

    it("should return invite for the user when the userId of a user is passed at it exists in the db", async function () {
      const invite = await getUserDiscordInvite("kfjkasdfl");
      expect(invite).to.have.property("id");
      expect(invite.notFound).to.be.equal(false);
      expect(invite.userId).to.be.equal("kfjkasdfl");
      expect(invite.inviteLink).to.be.equal("discord.gg/xyz");
    });

    it("should return notFound true, if the invite for user doesn't exist", async function () {
      const invite = await getUserDiscordInvite("kfjkasdafdfdsfl");
      expect(invite.notFound).to.be.equal(true);
    });
  });
});
