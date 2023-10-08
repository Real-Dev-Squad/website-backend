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
const archievedUser = userData[3];
const developerUserWithoutApprovedProfileStatus = userData[6];
const designerUser = userData[8];
const productManagerUser = userData[9];
const mavenUser = userData[10];

const config = require("config");
const sinon = require("sinon");
const cookieName = config.get("userToken.cookieName");
const firestore = require("../../utils/firestore");
const { userPhotoVerificationData } = require("../fixtures/user/photo-verification");
const photoVerificationModel = firestore.collection("photo-verification");
const discordRoleModel = firestore.collection("discord-roles");
const userModel = firestore.collection("users");

const { groupData } = require("../fixtures/discordactions/discordactions");
const { addGroupRoleToMember, addInviteToInviteModel } = require("../../models/discordactions");
chai.use(chaiHttp);

describe("Discord actions", function () {
  let superUserId;
  let archievedUserId;
  let designerUserId;
  let mavenUserId;
  let productManagerUserId;
  let developerUserWithoutApprovedProfileStatusId;
  let superUserAuthToken;
  let userAuthToken;
  let developerUserWithoutApprovedProfileStatusToken;
  let designerAuthToken;
  let mavenAuthToken;
  let productManagerAuthToken;
  let archievedUserToken;
  let userId = "";
  let discordId = "";
  let fetchStub;
  beforeEach(async function () {
    fetchStub = sinon.stub(global, "fetch");
    userId = await addUser();
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    userAuthToken = authService.generateAuthToken({ userId: userId });
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

  describe("GET /discord-actions/invite", function () {
    it("should return the invite for the user if no userId is provided in the params and the invite exists", async function () {
      const inviteId = await addInviteToInviteModel({ userId: superUserId, inviteLink: "discord.gg/apQYT7HB" });

      const res = await chai
        .request(app)
        .get("/discord-actions/invite")
        .set("cookie", `${cookieName}=${superUserAuthToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("object");
      expect(res.body).to.deep.equal({
        message: "Invite returned successfully",
        inviteResponse: {
          id: inviteId,
          inviteLink: "discord.gg/apQYT7HB",
          userId: superUserId,
        },
      });
    });

    it("Should return the invite for other user if the userId is provided in the query and the user is super user", async function () {
      const inviteId = await addInviteToInviteModel({ userId: userId, inviteLink: "discord.gg/apQYT7HA" });
      const res = await chai
        .request(app)
        .get(`/discord-actions/invite?userId=${userId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("object");
      expect(res.body).to.deep.equal({
        message: "Invite returned successfully",
        inviteResponse: {
          id: inviteId,
          inviteLink: "discord.gg/apQYT7HA",
          userId: userId,
        },
      });
    });

    it("should return 403 if the other user's id is provided and the user is not a super user", async function () {
      const res = await chai
        .request(app)
        .get(`/discord-actions/invite?userId=${superUserId}`)
        .set("cookie", `${cookieName}=${userAuthToken}`);
      expect(res).to.have.status(403);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.be.equal("User should be super user to get link for other users");
    });
  });

  describe("POST /discord-actions/invite", function () {
    it("should return 403 if the userId in the query param is not equal to the user of the user and user is not a super user", async function () {
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite?userId=${superUserId}`)
        .set("cookie", `${cookieName}=${userAuthToken}`);
      expect(res).to.have.status(403);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.be.equal("User should be super user to generate link for other users");
    });

    it("should return 403 if the user has discord id in their user object, which means user is already in discord", async function () {
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite`)
        .set("cookie", `${cookieName}=${userAuthToken}`);
      expect(res).to.have.status(403);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.be.equal("Only users who have never joined discord can generate invite link");
    });

    it("should return 403 if user has role archieved", async function () {
      archievedUserId = await addUser(archievedUser);
      archievedUserToken = authService.generateAuthToken({ userId: archievedUserId });
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite`)
        .set("cookie", `${cookieName}=${archievedUserToken}`);
      expect(res).to.have.status(403);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.be.equal("Archived users cannot generate invite");
    });

    it("should return 403 if the user doesn't have role designer, product_manager, or mavens", async function () {
      developerUserWithoutApprovedProfileStatusId = await addUser(developerUserWithoutApprovedProfileStatus);
      developerUserWithoutApprovedProfileStatusToken = authService.generateAuthToken({
        userId: developerUserWithoutApprovedProfileStatusId,
      });
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite`)
        .set("cookie", `${cookieName}=${developerUserWithoutApprovedProfileStatusToken}`);
      expect(res).to.have.status(403);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.be.equal(
        "Only mavens, product managers and designers can generate discord link directly, others need to have verified profile status"
      );
    });

    it("should generate discord link if user is a product mananger", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 201,
          json: () => Promise.resolve({ data: { code: "xyz" } }),
        })
      );

      productManagerUserId = await addUser(productManagerUser);
      productManagerAuthToken = authService.generateAuthToken({ userId: productManagerUserId });
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite`)
        .set("cookie", `${cookieName}=${productManagerAuthToken}`);

      expect(res).to.have.status(201);
      expect(res.body.message).to.be.equal("invite generated successfully");
      expect(res.body.inviteLink).to.be.equal("discord.gg/xyz");
    });

    it("should generate discord link if user is a designer", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 201,
          json: () => Promise.resolve({ data: { code: "zlmfasd" } }),
        })
      );

      designerUserId = await addUser(designerUser);
      designerAuthToken = authService.generateAuthToken({ userId: designerUserId });
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite`)
        .set("cookie", `${cookieName}=${designerAuthToken}`);

      expect(res).to.have.status(201);
      expect(res.body.message).to.be.equal("invite generated successfully");
      expect(res.body.inviteLink).to.be.equal("discord.gg/zlmfasd");
    });

    it("should generate discord link if user is a maven", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 201,
          json: () => Promise.resolve({ data: { code: "asdfdsfsd" } }),
        })
      );

      mavenUserId = await addUser(mavenUser);
      mavenAuthToken = authService.generateAuthToken({ userId: mavenUserId });
      const res = await chai
        .request(app)
        .post(`/discord-actions/invite`)
        .set("cookie", `${cookieName}=${mavenAuthToken}`);

      expect(res).to.have.status(201);
      expect(res.body.message).to.be.equal("invite generated successfully");
      expect(res.body.inviteLink).to.be.equal("discord.gg/asdfdsfsd");
    });
  });
});
