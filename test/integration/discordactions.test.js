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
    before(async function () {
      let allIds = [];

      const addUsersPromises = userData.map((user) => userModel.add({ ...user }));
      const responses = await Promise.all(addUsersPromises);
      allIds = responses.map((response) => response.id);

      const addRolesPromises = [
        discordRoleModel.add({ roleid: groupData[0].roleid, rolename: groupData[0].rolename, createdBy: allIds[1] }),
        discordRoleModel.add({ roleid: groupData[1].roleid, rolename: groupData[1].rolename, createdBy: allIds[0] }),
      ];
      await Promise.all(addRolesPromises);

      const addGroupRolesPromises = [
        addGroupRoleToMember({ roleid: groupData[0].roleid, userid: allIds[0] }),
        addGroupRoleToMember({ roleid: groupData[0].roleid, userid: allIds[1] }),
        addGroupRoleToMember({ roleid: groupData[0].roleid, userid: allIds[1] }),
        addGroupRoleToMember({ roleid: groupData[1].roleid, userid: allIds[0] }),
      ];
      await Promise.all(addGroupRolesPromises);
    });

    after(async function () {
      await cleanDb();
    });

    it("should successfully return all groups detail", function (done) {
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
          const expectedProps = ["roleid", "rolename", "count", "firstName", "lastName", "image"];
          res.body.groups.forEach((group) => {
            expect(group).to.include.all.keys(expectedProps);
          });
          expect(res.body.message).to.equal("Roles fetched successfully!");
          return done();
        });
    });
  });
});
