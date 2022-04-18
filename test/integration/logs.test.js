const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const config = require("config");
const cookieName = config.get("userToken.cookieName");
const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const userData = require("../fixtures/user/user")();
const superUser = userData[4];

describe("logs", function () {
  let defaultJwt, superUserJwt;

  before(async function () {
    const defaultUserId = await addUser();
    const superUserId = await addUser(superUser);

    defaultJwt = authService.generateAuthToken({ userId: defaultUserId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });
  });

  after(async function () {
    await cleanDb();
  });

  it("should return unauthenticated user", function (done) {
    chai
      .request(app)
      .get("/logs/TYPE_1")
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

  it("should return not authorized", function (done) {
    chai
      .request(app)
      .get("/logs/TYPE_1")
      .set("cookie", `${cookieName}=${defaultJwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(401);
        expect(res.body).to.be.an("object");
        expect(res.body).to.eql({
          statusCode: 401,
          error: "Unauthorized",
          message: "You are not authorized for this action.",
        });
        return done();
      });
  });

  it("should return logs successfully", function (done) {
    chai
      .request(app)
      .get("/logs/TYPE_1")
      .set("cookie", `${cookieName}=${superUserJwt}`)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.a("object");
        expect(res.body.message).to.be.equal("Logs returned successfully!");
        expect(res.body.logs).to.be.a("array");
        return done();
      });
  });
});
