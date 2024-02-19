const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const { userStatusDataForNewUser } = require("../fixtures/usersStatus/usersStatus");

const config = require("config");
const { updateUserStatus } = require("../../models/usersStatus");

const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("UserStatus", function () {
  let jwt;
  let userId = "";

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    await updateUserStatus(userId, userStatusDataForNewUser);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /user/status/:userid", function () {
    it("Should return the User Status Document with the given id", function (done) {
      chai
        .request(app)
        .get(`/user/status/${userId}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully.");
          expect(res.body.userId).to.equal(userId);
          expect(res.body.data.state).to.equal("CURRENT");
          return done();
        });
    });
    it("Should return the User Status Document of the user requesting it", function (done) {
      chai
        .request(app)
        .get(`/user/status/self`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Status found successfully.");
          expect(res.body.userId).to.equal(userId);
          expect(res.body.data.state).to.equal("CURRENT");
          return done();
        });
    });
  });
});
