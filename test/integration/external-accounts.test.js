const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const externalAccountData = require("../fixtures/external-accounts/external-accounts")();
const bot = require("../utils/generateBotToken");
const { BAD_TOKEN, CLOUDFLARE_WORKER } = require("../../constants/bot");

chai.use(chaiHttp);

describe("External Accounts", function () {
  let jwtToken;

  beforeEach(async function () {
    jwtToken = bot.generateToken({ name: CLOUDFLARE_WORKER });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /external-accounts", function () {
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
  });
});
