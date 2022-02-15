const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const users = require("../../models/users");
const recruiters = require("../../models/recruiters");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const cookieName = config.get("userToken.cookieName");
// Import fixtures
const userData = require("../fixtures/user/user")();
const { recruiterDataArray, recruiterWithIdKeys } = require("../fixtures/recruiter/recruiter");

const superUser = userData[4];
const nonSuperUser = userData[2];

chai.use(chaiHttp);

describe("Recruiters", function () {
  let username;
  let recruiterData;
  let jwt;
  beforeEach(async function () {
    const superUserId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId: superUserId });

    const userId = await addUser();
    const { user } = await users.fetchUser({ userId });

    username = user.username;
    recruiterData = recruiterDataArray[0];
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("POST /members/intro/:username", function () {
    it("Should return success response after adding recruiter data", function (done) {
      chai
        .request(app)
        .post(`/members/intro/${username}`)
        .send(recruiterData)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Request Submission Successful!!");
          expect(res.body.result).to.be.a("object");
          expect(res.body.result.recruiterId).to.be.a("string");
          expect(res.body.result.recruiterName).to.be.a("string");
          expect(res.body.result.userInfo).to.be.a("string");
          expect(res.body.result.timestamp).to.be.a("number");

          return done();
        });
    });

    it("Should return 404 if user not found ", function (done) {
      chai
        .request(app)
        .post("/members/intro/invalidUsername")
        .send(recruiterData)
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 404,
            error: "Not Found",
            message: "User doesn't exist",
          });

          return done();
        });
    });
  });

  describe("GET /members/intro", function () {
    it("Should return empty array if no recruiters data is found", function (done) {
      chai
        .request(app)
        .get("/members/intro")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Recruiters returned successfully!");
          expect(res.body.recruiters).to.eql([]);

          return done();
        });
    });

    it("Get all the recruiters data in the database", function (done) {
      recruiters.addRecruiterInfo(recruiterData, username).then(() => {
        chai
          .request(app)
          .get("/members/intro")
          .set("cookie", `${cookieName}=${jwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("Recruiters returned successfully!");
            expect(res.body.recruiters).to.be.a("array");
            expect(res.body.recruiters).to.have.length.above(0);
            expect(res.body.recruiters[0]).to.have.all.keys(...recruiterWithIdKeys);
            expect(res.body.recruiters[0].username).to.equal(username);

            return done();
          });
      });
    });

    it("Should return 401 if user is not a super_user", function (done) {
      addUser(nonSuperUser).then((nonSuperUserId) => {
        const nonSuperUserJwt = authService.generateAuthToken({ userId: nonSuperUserId });
        chai
          .request(app)
          .get("/members/intro")
          .set("cookie", `${cookieName}=${nonSuperUserJwt}`)
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(401);
            expect(res.body).to.be.a("object");
            expect(res.body.message).to.equal("You are not authorized for this action.");

            return done();
          });
      });
    });
  });
});
