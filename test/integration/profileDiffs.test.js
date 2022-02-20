const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");

const addUser = require("../utils/addUser");

const userData = require("../fixtures/user/user")();
const newUser = userData[3];
const superUser = userData[4];

const config = require("config");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("GET /profileDiffs", function () {
  let newUserId;
  let newUserAuthToken;

  let superUserId;
  let superUserAuthToken;

  before(async function () {
    newUserId = await addUser(newUser);
    newUserAuthToken = authService.generateAuthToken({ userId: newUserId });

    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
  });

  it("Should return pending profileDiffs, using authorized user (super_user)", function (done) {
    chai
      .request(app)
      .get("/profileDiffs")
      .set("cookie", `${cookieName}=${superUserAuthToken}`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        expect(response).to.have.status(200);
        expect(response.body.message).to.be.equal("Profile Diffs returned successfully!");

        return done();
      });
  });

  it("Should return unauthorized error when not authorized", function (done) {
    chai
      .request(app)
      .get("/profileDiffs")
      .set("cookie", `${cookieName}=${newUserAuthToken}`)
      .end((error, response) => {
        if (error) {
          return done(error);
        }

        expect(response).to.have.status(401);
        expect(response.body.error).to.be.equal("Unauthorized");
        expect(response.body.message).to.be.equal("You are not authorized for this action.");

        return done();
      });
  });
});
