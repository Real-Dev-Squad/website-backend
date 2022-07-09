const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const addUser = require("../utils/addUser");
const authService = require("../../services/authService");
const cleanDb = require("../utils/cleanDb");

const config = require("config");
const cookieName = config.get("userToken.cookieName");

const userData = require("../fixtures/user/user")();

chai.use(chaiHttp);

describe("Logs", function () {
  let jwt;

  afterEach(async function () {
    await addUser();
  });

  after(async function () {
    await cleanDb();
  });

  describe("GET /logs/member/cache/self", function () {
    before(async function () {
      await cleanDb();
      const userId = await addUser(userData[0]);
      jwt = authService.generateAuthToken({ userId });
    });

    it("Should return logs of the last 24 hours of user", function (done) {
      chai
        .request(app)
        .get("/logs/member/cache/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((error, response) => {
          if (error) {
            return done(error);
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body.message).to.be.a("string");
          expect(response.body.count).to.be.a("number");
          expect(response.body.logs).to.be.an("array");
          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .get("/logs/member/cache/self")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "Unauthenticated User",
          });
          return done();
        });
    });
  });
});
