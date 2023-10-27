const chai = require("chai");
const { expect } = chai;

const app = require("../../server");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const authService = require("../../services/authService");
const userData = require("../fixtures/user/user")();
const { requestRoleData } = require("../fixtures/discordactions/discordactions");

const firestore = require("../../utils/firestore");
const discordRoleModel = firestore.collection("discord-roles");
const userModel = firestore.collection("users");

const { addGroupRoleToMember } = require("../../models/discordactions");

const { groupData } = require("../fixtures/discordactions/discordactions");

const cookieName = config.get("userToken.cookieName");

let userId;
let jwt;

describe("test discord actions", function () {
  describe("test discord actions for archived users", function (done) {
    beforeEach(async function () {
      userId = await addUser(userData[5]);
      jwt = authService.generateAuthToken({ userId });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("returns 403 for archived users post method", function (done) {
      chai
        .request(app)
        .post("/discord-actions/groups")
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(requestRoleData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(403);
          return done();
        });
    });

    it("returns 403 for archived users get method", function (done) {
      chai
        .request(app)
        .get("/discord-actions/groups")
        .set("Cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(403);
          return done();
        });
    });
  });

  describe("test discord actions for active users", function () {
    beforeEach(async function () {
      const user = { ...userData[4], discordId: "123456789" };
      userId = await addUser(user);
      jwt = authService.generateAuthToken({ userId });

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
    afterEach(async function () {
      await cleanDb();
    });

    it("returns 200 for active users get method", function (done) {
      chai
        .request(app)
        .get("/discord-actions/groups")
        .set("Cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          return done();
        });
    });
  });
});
