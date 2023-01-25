const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const app = require("../../server");
const cleanDb = require("../utils/cleanDb");
const discordData = require("../fixtures/discord/discord")();
const botVerifcation = require("../../services/botVerificationService");
const { BAD_TOKEN } = require("../../constants/bot");

chai.use(chaiHttp);

describe("Discord", function () {
  let jwtToken;

  beforeEach(async function () {
    jwtToken = botVerifcation.generateToken();
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("PUT /discord", function () {
    it("Should create a new discord data in firestore", function (done) {
      chai
        .request(app)
        .put("/discord")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send(discordData[0])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.have.property("message");
          expect(res.body.message).to.equal("Added discord data successfully");

          return done();
        });
    });

    it("Should return 400 when adding incorrect discord data in firestore", function (done) {
      chai
        .request(app)
        .put("/discord")
        .set("Authorization", `Bearer ${jwtToken}`)
        .send(discordData[1])
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          expect(res.body).to.have.property("error");
          expect(res.body.message).to.equal('"linkStatus" must be a boolean');
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return 400 when authorization header is not present", function (done) {
      chai
        .request(app)
        .put("/discord")
        .send(discordData[0])
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
        .put("/discord")
        .set("Authorization", `Bearer ${BAD_TOKEN}`)
        .send(discordData[0])
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
