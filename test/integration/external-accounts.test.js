const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const bot = require("../utils/generateBotToken");
const addUser = require("../utils/addUser");
const { BAD_TOKEN, CLOUDFLARE_WORKER } = require("../../constants/bot");
const authService = require("../../services/authService");
const externalAccountData = require("../fixtures/external-accounts/external-accounts")();
const externalAccountsModel = require("../../models/external-accounts");
const { usersFromRds, getDiscordMembers } = require("../fixtures/discordResponse/discord-response");
const Sinon = require("sinon");
const { INTERNAL_SERVER_ERROR } = require("../../constants/errorMessages");
const firestore = require("../../utils/firestore");
const userData = require("../fixtures/user/user")();
const userModel = firestore.collection("users");

chai.use(chaiHttp);
const cookieName = config.get("userToken.cookieName");

describe("External Accounts", function () {
  describe("POST /external-accounts", function () {
    let jwtToken;

    beforeEach(async function () {
      jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Should create a new external account data in firestore", function (done) {
      chai
        .request(app)
        .post("/external-accounts")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send(externalAccountData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Added external account data successfully");

          return done();
        });
    });

    it("Should return 400 when adding incorrect data in firestore", function (done) {
      chai
        .request(app)
        .post("/external-accounts")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send(externalAccountData[1])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("error");
          expect(res.body.message).to.equal('"token" must be a string');
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return 400 when authorization header is not present", function (done) {
      chai
        .request(app)
        .post("/external-accounts")
        .send(externalAccountData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("error");
          expect(res.body.message).to.equal("Invalid Request");
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return 401 when authorization header is incorrect", function (done) {
      chai
        .request(app)
        .post("/external-accounts")
        .set("Authorization", `Bearer ${BAD_TOKEN}`)
        .send(externalAccountData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("error");
          expect(res.body.message).to.equal("Unauthorized Bot");
          expect(res.body.error).to.equal("Unauthorized");

          return done();
        });
    });

    it("Should return 409 when token already exists", function (done) {
      externalAccountsModel.addExternalAccountData(externalAccountData[0]);
      chai
        .request(app)
        .post("/external-accounts")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send(externalAccountData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(409);
          expect(res.body).to.be.eql({
            statusCode: 409,
            error: "Conflict",
            message: "Token already exists",
          });

          return done();
        });
    });
  });

  describe("GET /external-accounts/:token", function () {
    let jwt;

    beforeEach(async function () {
      const userId = await addUser();
      jwt = authService.generateAuthToken({ userId });
      await externalAccountsModel.addExternalAccountData(externalAccountData[2]);
      await externalAccountsModel.addExternalAccountData(externalAccountData[3]);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Should return 200 when data is returned successfully", function (done) {
      chai
        .request(app)
        .get("/external-accounts/<TOKEN>")
        .set("Authorization", `Bearer ${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Data returned successfully");
          expect(res.body).to.have.property("attributes");
          expect(res.body.attributes).to.have.property("discordId");
          expect(res.body.attributes).to.have.property("expiry");
          expect(res.body.attributes.discordId).to.equal("<DISCORD_ID>");
          return done();
        });
    });

    it("Should return 404 when no data found", function (done) {
      chai
        .request(app)
        .get("/external-accounts/<TOKEN_2>")
        .set("Authorization", `Bearer ${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("No data found");

          return done();
        });
    });

    it("Should return 401 when token is expired", function (done) {
      chai
        .request(app)
        .get("/external-accounts/<TOKEN_1>")
        .set("Authorization", `Bearer ${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Token Expired. Please generate it again",
          });

          return done();
        });
    });

    it("Should return 401 when user is not authenticated", function (done) {
      chai
        .request(app)
        .get("/external-accounts/<TOKEN>")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("PATCH /external-accounts/discord-sync", function () {
    let superUserJwt, fetchStub;

    beforeEach(async function () {
      // userData[4] is a super user
      const userId = await addUser(userData[4]);
      superUserJwt = authService.generateAuthToken({ userId });
      await userModel.add(usersFromRds[0]);
      await userModel.add(usersFromRds[1]);
      fetchStub = Sinon.stub(global, "fetch");
    });

    afterEach(async function () {
      Sinon.restore();
      await cleanDb();
    });

    it("updates user and adds discord related data", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
      chai
        .request(app)
        .patch("/external-accounts/discord-sync")
        .set("Cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            rdsUsers: 3,
            discordUsers: 2,
            userUpdatedWithInDiscordFalse: 1,
            message: "Data Sync Complete",
          });
          return done();
        });
    });

    it("returns 5xx errors", function (done) {
      fetchStub.throws(new Error("Some Internal Error"));
      chai
        .request(app)
        .patch("/external-accounts/discord-sync")
        .set("Cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.equal({
            message: INTERNAL_SERVER_ERROR,
          });
          return done();
        });
    });
  });
});
