const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const superUser = userData[4];

const config = require("config");
const sinon = require("sinon");
const cookieName = config.get("userToken.cookieName");
const firestore = require("../../utils/firestore");
const { userPhotoVerificationData } = require("../fixtures/user/photo-verification");
const photoVerificationModel = firestore.collection("photo-verification");
const discordRoleModel = firestore.collection("discord-roles");
const userModel = firestore.collection("users");

const { groupData } = require("../fixtures/discordactions/discordactions");
const { addGroupRoleToMember } = require("../../models/discordactions");
chai.use(chaiHttp);

describe("Discord actions", function () {
  let superUserId;
  let superUserAuthToken;
  let userId = "";
  let discordId = "";
  let fetchStub;
  beforeEach(async function () {
    fetchStub = sinon.stub(global, "fetch");
    userId = await addUser();
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
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
      const addUsersPromises = userData.map((user) => userModel.add({ ...user })); // Mapping over the mock users data and adding them to the usermodel(firestore instance)
      const responses = await Promise.all(addUsersPromises); // waiting for all of them to get added to firestore instance and get an array of the responses after adding
      allIds = responses.map((response) => response.id); // now getting Id's of the newly added users to the firestore instance
      newGroupData = groupData.map((group, index) => {
        // adding createdBy peoperty to each group-object
        return {
          ...group,
          createdBy: allIds[Math.min(index, allIds.length - 1)], // It prevents accessing an index that doesn't exist, which could lead to errors.
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

  describe("POST /discord-actions/nicknames/sync", function () {
    let superUserId;
    let superUserAuthToken;
    let fetchStub;
    beforeEach(async function () {
      fetchStub = sinon.stub(global, "fetch");
      superUserId = await addUser(superUser);
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
      const archivedRole = { roles: { archived: false } };
      // const addUsersWithRolePromises = [
      await addUser({ ...userData[0], archivedRole });
      await addUser({ ...userData[1], archivedRole });
      await addUser({ ...userData[2], archivedRole });
      // ];
      // await Promise.all(addUsersWithRolePromises);
    });

    afterEach(async function () {
      sinon.restore();
      await cleanDb();
    });

    it("should successfully update discord nicknames", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(),
        })
      );
      chai
        .request(app)
        .post(`/users/discord/nicknames?dev=true`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Users Nicknames updated successfully");
          expect(res.body.numberOfUsersEffected).to.be.equal(3);
          return done();
        });
    });
    it("updates the nickname with username", function (done) {
      // fetchStub.returns(
      //   Promise.resolve({
      //     status: 200,
      //     json: () => Promise.resolve(updatedNicknameResponse),
      //   })
      // );
      chai
        .request(app)
        .post(`/users/discord/nicknames?dev=true`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          // expect(res).to.have.status(200);
          // expect(res.body.message).to.be.equal("Users Nicknames updated successfully");
          // expect(res.body.userAffected).to.be.equal("test-name-007");
          return done();
        });
    });

    it("returns an error for unsuccessful updating nicknames with POST method", function (done) {
      fetchStub.returns(Promise.reject(new Error("User not verified")));

      chai
        .request(app)
        .post(`/users/discord/nicknames?dev=true`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          const response = res.body;
          expect(response.message).to.be.equal("An internal server error occurred");
          return done();
        });
    });
  });
});
