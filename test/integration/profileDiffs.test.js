import chai from "chai";
import chaiHttp from "chai-http";
import config from "config";

import app from "../../server.js";
import { generateAuthToken } from "../../services/authService.js";
import addUser from "../utils/addUser.js";
import userData from "../fixtures/user/user.js";

const { expect } = chai;
const cookieName = config.get("userToken.cookieName");

const newUser = userData[3];
const superUser = userData[4];

chai.use(chaiHttp);

describe("GET /profileDiffs", function () {
  let newUserId;
  let newUserAuthToken;

  let superUserId;
  let superUserAuthToken;

  before(async function () {
    newUserId = await addUser(newUser);
    newUserAuthToken = generateAuthToken({ userId: newUserId });

    superUserId = await addUser(superUser);
    superUserAuthToken = generateAuthToken({ userId: superUserId });
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
        expect(response.body.profileDiffs.length).to.be.equal(0);

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
