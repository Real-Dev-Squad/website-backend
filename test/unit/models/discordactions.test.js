const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const firestore = require("../../../utils/firestore");
const photoVerificationModel = firestore.collection("photo-verification");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const userModel = firestore.collection("users");
const admin = require("firebase-admin");

const {
  createNewRole,
  getAllGroupRoles,
  getGroupRolesForUser,
  isGroupRoleExists,
  addGroupRoleToMember,
  updateDiscordImageForVerification,
  enrichGroupDataWithMembershipInfo,
  fetchGroupToUserMapping,
} = require("../../../models/discordactions");
const { groupData, roleData, existingRole } = require("../../fixtures/discordactions/discordactions");
const cleanDb = require("../../utils/cleanDb");
const { userPhotoVerificationData } = require("../../fixtures/user/photo-verification");
const userData = require("../../fixtures/user/user")();

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
    let getStub;

    beforeEach(function () {
      getStub = sinon.stub(discordRoleModel, "where").returns({
        limit: sinon.stub().resolves({
          empty: true,
          forEach: sinon.stub(),
        }),
      });
    });

    afterEach(function () {
      getStub.restore();
    });

    it("should return true if role doesn't exist in the database", async function () {
      const result = await isGroupRoleExists("Test Role");
      expect(result.wasSuccess).to.equal(true);
      expect(getStub.calledOnceWith("rolename", "==", "Test Role")).to.equal(false);
    });

    it("should return false if role already exists in the database", async function () {
      const existingRole = { rolename: "Test Role" };
      const callbackFunction = (role) => {
        const roleData = role.data();
        existingRole.push(roleData);
      };

      getStub.returns({
        limit: sinon.stub().resolves({
          empty: false,
          forEach: callbackFunction,
        }),
      });

      const errorCallback = sinon.stub();
      const result = await isGroupRoleExists("Test Role");
      expect(result.wasSuccess).to.equal(true);
      expect(getStub.calledOnceWith("rolename", "==", "Test Role")).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(false);
    });

    it("should throw an error if getting group-roles fails", async function () {
      getStub.rejects(new Error("Database error"));
      return isGroupRoleExists("Test Role").catch((err) => {
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

  describe.only("getGroupRolesForUser", function () {
    let getStub;
  
    beforeEach(function () {
      getStub = sinon.stub(memberRoleModel, "where");
    });
  
    afterEach(function () {
      sinon.restore();
    });
  
    it.only("should return user roles for a given discordId", async function () {
      const discordId = "12345";
      const userRolesSnapshot = {
        docs: [
          { data: () => ({ roleid: "role1", userid: "12345" }) },
          { data: () => ({ roleid: "role2", userid: "12345" }) },
        ],
      };
      getStub.resolves(userRolesSnapshot);
  
      const result = await getGroupRolesForUser(discordId);
      console.log(result)
  
      expect(result).to.deep.equal({
        userId: discordId,
        groups: [{ roleId: "role1" }, { roleId: "role2" }],
      });
    });
  
    it("should handle errors and log them", async function () {
      const discordId = "12345";
      const error = new Error("Database error");
      getStub.rejects(error);
      const loggerStub = sinon.stub(logger, "error");
  
      try {
        await getGroupRolesForUser(discordId);
      } catch (err) {
        expect(err).to.equal(error);
        expect(loggerStub.calledOnce).to.be.equal(true);
        expect(loggerStub.calledWith("Error fetching user roles:", error)).to.be.equal(true);
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
});
