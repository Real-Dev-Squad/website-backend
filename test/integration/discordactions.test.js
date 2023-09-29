const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const usersInDiscord = require("../fixtures/user/inDiscord");
const superUser = userData[4];

const config = require("config");
const sinon = require("sinon");
const cookieName = config.get("userToken.cookieName");
const firestore = require("../../utils/firestore");
const { userPhotoVerificationData } = require("../fixtures/user/photo-verification");
const photoVerificationModel = firestore.collection("photo-verification");
const discordRoleModel = firestore.collection("discord-roles");
const memberRoleModel = firestore.collection("member-group-roles");
const userModel = firestore.collection("users");

const { groupData, groupIdle7d, roleDataFromDiscord } = require("../fixtures/discordactions/discordactions");
const discordServices = require("../../services/discordService");
const { addGroupRoleToMember } = require("../../models/discordactions");
const { updateUserStatus } = require("../../models/userStatus");
const { generateUserStatusData } = require("../fixtures/userStatus/userStatus");
const { getDiscordMembers } = require("../fixtures/discordResponse/discord-response");
chai.use(chaiHttp);

describe("Discord actions", function () {
  let superUserId;
  let superUserAuthToken;
  let userId = "";
  let discordId = "";
  let fetchStub;
  let jwt;
  beforeEach(async function () {
    fetchStub = sinon.stub(global, "fetch");
    userId = await addUser();
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    jwt = authService.generateAuthToken({ userId });
    discordId = "12345";

    const docRefUser0 = photoVerificationModel.doc();
    userPhotoVerificationData.userId = userId;
    userPhotoVerificationData.discordId = discordId;
    await docRefUser0.set(userPhotoVerificationData);
  });

  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("PATCH /discord-actions/picture/id", function () {
    it("Should successfully update a picture", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ user: { avatar: 12345 } }),
        })
      );
      chai
        .request(app)
        .patch(`/discord-actions/avatar/verify/${discordId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Discord avatar URL updated successfully!");
          return done();
        });
    });
    it("Should throw error if failed to update a picture", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ user: { avatar: 12345 } }),
        })
      );
      chai
        .request(app)
        .patch(`/discord-actions/avatar/verify/${discordId + "random-error-string"}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("An internal server error occurred");
          return done();
        });
    });
  });

  describe("GET /discord-actions/groups", function () {
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

    it("should successfully return old groups detail", function (done) {
      chai
        .request(app)
        .get(`/discord-actions/groups`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          // Verify presence of specific properties in each group
          const expectedProps = ["roleid", "rolename", "memberCount", "firstName", "lastName", "image", "isMember"];
          res.body.groups.forEach((group) => {
            expect(group).not.to.include.all.keys(expectedProps);
          });
          expect(res.body.message).to.equal("Roles fetched successfully!");
          return done();
        });
    });

    it("should successfully return api response correctly", function (done) {
      chai
        .request(app)
        .get(`/discord-actions/roles`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          // Verify presence of specific properties in each group
          const expectedProps = ["roleid", "userId"];
          res.body.groups.forEach((group) => {
            expect(group).not.to.include.all.keys(expectedProps);
          });
          expect(res.body.message).to.equal("User group roles Id fetched successfully!");
          return done();
        });
    });

    it("should successfully return new groups detail when flag is set", function (done) {
      chai
        .request(app)
        .get(`/discord-actions/groups?dev=true`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          // Verify presence of specific properties in each group
          const expectedProps = ["roleid", "rolename", "memberCount", "firstName", "lastName", "image", "isMember"];
          res.body.groups.forEach((group) => {
            expect(group).to.include.all.keys(expectedProps);
          });
          expect(res.body.message).to.equal("Roles fetched successfully!");
          return done();
        });
    });
  });

  describe("DELETE /discord-actions/roles", function () {
    beforeEach(async function () {
      const addRolePromises = memberGroupData.map(async (data) => {
        await memberRoleModel.add(data);
      });

      await Promise.all(addRolePromises);
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should delete a role successfully", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ roleId: "1234", wasSuccess: true }),
        })
      );
      chai
        .request(app)
        .delete("/discord-actions/roles")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(memberGroupData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Role deleted successfully");

          return done();
        });
    });

    it("should handle internal server error", function (done) {
      const mockdata = {
        roleid: "mockroleid",
        userid: "mockUserId",
      };
      chai
        .request(app)
        .delete("/discord-actions/roles")
        .set("cookie", `${cookieName}=${jwt}`)
        .send(mockdata)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(500);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Internal server error");
          return done();
        });
    });
  });

  describe("POST /discord-actions/nicknames/sync", function () {
    beforeEach(async function () {
      userData[0].discordId = "232533446310887426";
      userData[1].discordId = "415438605813678080";
      userData[2].discordId = "416635283048628224";
      userData[17].discordId = "416635283048628225";

      await addUser(userData[0]);
      await addUser(userData[1]);
      await addUser(userData[2]);
      await addUser(userData[17]);
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should successfully update nicknames of users who have developer-role in the discord server and show user whose nickname not updated", function (done) {
      const discordUsers = usersInDiscord();
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(discordUsers),
        })
      );
      chai
        .request(app)
        .post(`/discord-actions/nicknames/sync?dev=true`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Users Nicknames updated successfully");
          expect(res.body.totalNicknamesUpdated.count).to.be.equal(3);
          expect(res.body.totalNicknamesNotUpdated.errors.length).to.be.equal(0);

          return done();
        });
    });
  });

  describe("POST /discord-actions/discord-roles", function () {
    before(async function () {
      const value = [discordRoleModel.add(groupData[0]), discordRoleModel.add(groupData[1])];

      await Promise.all(value);

      sinon.stub(discordServices, "getDiscordRoles").returns(roleDataFromDiscord);
    });

    after(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should successfully update discord role into firestore", function (done) {
      chai
        .request(app)
        .post(`/discord-actions/discord-roles`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.response.length).to.be.equal(3);
          expect(res.body.message).to.equal("Discord groups synced with firestore successfully");
          return done();
        });
    });
  });

  describe("PUT /discord-actions/group-idle-7d", function () {
    let allIds;
    beforeEach(async function () {
      userData[0].roles = { archived: false };
      userData[1].roles = { archived: false };
      userData[2].roles = { archived: false };
      await addUser(userData[0]);
      await addUser(userData[1]);
      await addUser(userData[2]);

      const addUsersPromises = userData.slice(0, 3).map((user) => userModel.add({ ...user }));
      const responses = await Promise.all(addUsersPromises);
      allIds = responses.map((response) => response.id);

      const userStatusPromises = allIds.map(async (userId) => {
        await updateUserStatus(userId, generateUserStatusData("IDLE", 1690829925336, 1690829925336));
      });
      await Promise.all(userStatusPromises);

      const addRolesPromises = [discordRoleModel.add(groupIdle7d)];
      await Promise.all(addRolesPromises);

      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should update Idle 7d+ Users successfully and return a 201 status code", function (done) {
      chai
        .request(app)
        .put(`/discord-actions/group-idle-7d`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("All Idle 7d+ Users updated successfully.");
          expect(res.body.totalIdle7dUsers).to.be.equal(3);
          expect(res.body.totalGroupIdle7dRolesApplied.count).to.be.equal(3);
          expect(res.body.totalUserRoleToBeAdded).to.be.equal(3);
          return done();
        });
    });
  });
});
