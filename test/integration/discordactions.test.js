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
const userStatusModel = firestore.collection("usersStatus");

const {
  groupData,
  groupIdle7d,
  roleDataFromDiscord,
  memberGroupData,
  groupOnboarding31dPlus,
} = require("../fixtures/discordactions/discordactions");
const discordServices = require("../../services/discordService");
const { addGroupRoleToMember } = require("../../models/discordactions");
const { updateUserStatus } = require("../../models/userStatus");
const { generateUserStatusData } = require("../fixtures/userStatus/userStatus");
const { getDiscordMembers } = require("../fixtures/discordResponse/discord-response");
const { getOnboarding31DPlusMembers } = require("../fixtures/discordResponse/discord-response");

chai.use(chaiHttp);
const { userStatusDataForOooState } = require("../fixtures/userStatus/userStatus");
const { generateCronJobToken } = require("../utils/generateBotToken");
const { CRON_JOB_HANDLER } = require("../../constants/bot");

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

  describe("POST /discord-actions/nickname/status", function () {
    let jwtToken;
    beforeEach(async function () {
      const { id } = await userModel.add({ ...userData[0] });
      const statusData = {
        ...userStatusDataForOooState,
        futureStatus: {
          state: "ACTIVE",
          updatedAt: 1668211200000,
          from: 1668709800000,
        },
        userId: id,
      };
      await userStatusModel.add(statusData);
      jwtToken = generateCronJobToken({ name: CRON_JOB_HANDLER });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should successfully return response when user nickname changes", function (done) {
      const response = "Username updated successfully";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(response),
        })
      );

      chai
        .request(app)
        .post("/discord-actions/nickname/status")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          lastNicknameUpdate: (userStatusDataForOooState.currentStatus.updatedAt - 1000 * 60 * 10).toString(),
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res).to.be.an("object");
          expect(res.body).to.deep.equal({
            message: "Updated discord users nickname based on status",
            data: {
              totalUsersStatus: 1,
              successfulNicknameUpdates: 1,
              unsuccessfulNicknameUpdates: 0,
            },
          });
          return done();
        });
    }).timeout(10000);

    it("should return object with 0 successful updates when user nickname changes", function (done) {
      const response = "Error occurred while updating user's nickname";
      fetchStub.returns(Promise.reject(response));

      chai
        .request(app)
        .post("/discord-actions/nickname/status")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send({
          lastNicknameUpdate: (userStatusDataForOooState.currentStatus.updatedAt - 1000 * 60 * 10).toString(),
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(500);
          expect(res.body.message).to.equal("An internal server error occurred");
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

  describe("PUT /discord-actions/group-onboarding-31d-plus", function () {
    beforeEach(async function () {
      userData[0] = {
        ...userData[0],
        discordId: "123456789098765432",
        discordJoinedAt: "2023-07-31T16:57:53.894000+00:00",
        roles: { archived: false, in_discord: true },
      };
      userData[1] = {
        ...userData[1],
        discordId: "12345678909867666",
        discordJoinedAt: "2023-07-31T16:57:53.894000+00:00",
        roles: { archived: false, in_discord: true },
      };
      userData[2] = {
        ...userData[2],
        discordId: "123456",
        discordJoinedAt: "2023-07-31T16:57:53.894000+00:00",
        roles: { archived: false, in_discord: true },
      };
      userData[3] = {
        ...userData[3],
        discordId: "9653710123456",
        discordJoinedAt: "2023-07-31T16:57:53.894000+00:00",
        roles: { archived: false, in_discord: true },
      };

      const allUsers = [userData[0], userData[1], userData[2], userData[3]];

      const addUsersPromises = allUsers.map((user) => addUser(user));
      const userIds = await Promise.all(addUsersPromises);

      const updateUserStatusPromises = userIds.map((userId, index) => {
        if (index === 3) return updateUserStatus(userId, generateUserStatusData("IDLE", new Date(), new Date()));
        return updateUserStatus(userId, generateUserStatusData("ONBOARDING", new Date(), new Date()));
      });
      await Promise.all(updateUserStatusPromises);

      await discordRoleModel.add(groupOnboarding31dPlus);

      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getOnboarding31DPlusMembers),
        })
      );
    });
    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should update role for onboarding users with 31 days completed", function (done) {
      chai
        .request(app)
        .put(`/discord-actions/group-onboarding-31d-plus`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("All Users with 31 Days Plus Onboarding are updated successfully.");
          expect(res.body.totalOnboardingUsers31DaysCompleted.count).to.be.equal(3);
          expect(res.body.totalOnboarding31dPlusRoleApplied.count).to.be.equal(3);
          expect(res.body.totalOnboarding31dPlusRoleRemoved.count).to.be.equal(1);
          return done();
        });
    });
  });
});
