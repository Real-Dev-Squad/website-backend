const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const { fetchUser } = require("../../models/users");
const skillsData = require("../fixtures/skills/skills")();
const cleanDb = require("../utils/cleanDb");

const config = require("config");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Skills", function () {
  let jwt;
  let userName;

  beforeEach(async function () {
    const userId = await addUser();
    jwt = authService.generateAuthToken({ userId });

    const { user } = await fetchUser({ userId });
    userName = user.username;
  });

  afterEach(async function () {
    await cleanDb();
  });
  describe("POST /skills/:username", function () {
    it("Should add data to skills model & return successful response", function (done) {
      chai
        .request(app)
        .post(`/skills/${userName}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(skillsData[0])
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Added data successfully!");
          expect(res.body.content).to.be.a("object");
          expect(res.body.content.name).to.be.a("string");
          expect(res.body.content.awarded_on).to.be.a("string");
          expect(res.body.content.awarded_by).to.be.a("string");
          expect(res.body.content.awarded_for).to.be.a("string");

          return done();
        });
    });

    it("Should return 401 for anunthenticated user", function (done) {
      chai
        .request(app)
        .post(`/skills/${userName}`)
        .send(skillsData[0])
        .end((err, res) => {
          if (err) return done(err);

          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body).to.deep.equal({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });

          return done();
        });
    });
  });

  describe("GET /skills", function () {
    it("Should get the list of skills", function (done) {
      chai
        .request(app)
        .get("/skills")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Skills returned successfully!");
          expect(res.body.skills).to.be.a("array");

          return done();
        });
    });
  });
});
