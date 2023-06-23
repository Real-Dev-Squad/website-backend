const chai = require("chai");
const { expect } = chai;

const app = require("../../server");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const authService = require("../../services/authService");
const userData = require("../fixtures/user/user")();
const { requestRoleData } = require("../fixtures/discordactions/discordactions");
const cookieName = config.get("userToken.cookieName");
const sinon = require("sinon");
let userId;
let jwt;
let fetchStub;
let superUser;
let superUserId;
let superUserAuthToken;

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

  describe("test discord actions for nickname for verified user", function () {
    beforeEach(async function () {
      fetchStub = sinon.stub(global, "fetch");
      superUser = { ...userData[4], discordId: "123456789" };
      userId = await addUser(userData[0]);
      superUserId = await addUser(superUser);
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    });

    afterEach(async function () {
      await cleanDb();
      sinon.restore();
    });

    it("returns 200 for updating nickname patch method", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({}),
        })
      );
      chai
        .request(app)
        .patch(`/users/username/${userId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.equal("nickname has been changed");
          return done();
        });
    });
  });

  describe("test discord actions for nickname for unverified user", function () {
    beforeEach(async function () {
      const { discordId, ...superUser } = userData[4];
      superUserId = await addUser(superUser);
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    });

    afterEach(async function () {
      await cleanDb();
      sinon.restore();
    });

    it("returns 403 for updating nickname patch method", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({}),
        })
      );
      chai
        .request(app)
        .patch(`/users/username/${userData[3].userId}`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(403);
          return done();
        });
    });
  });
});
