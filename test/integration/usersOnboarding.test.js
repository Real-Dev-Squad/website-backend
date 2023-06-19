const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

// Import fixtures
const userData = require("../fixtures/user/user")();
const {
  userStatusDataAfterFillingJoinSection,
  userStatusDataForNewUser,
} = require("../fixtures/userStatus/userStatus");

const { updateUserStatus } = require("../../models/userStatus");

chai.use(chaiHttp);

describe("UserOnboarding", function () {
  let userId1 = "";
  let userId2 = "";
  let userId3 = "";

  beforeEach(async function () {
    userId1 = await addUser(userData[userData.length - 1]);
    userId3 = await addUser();
    userId2 = await addUser(userData[1]);

    await updateUserStatus(userId1, userStatusDataAfterFillingJoinSection);
    await updateUserStatus(userId2, userStatusDataForNewUser);
    await updateUserStatus(userId3, userStatusDataForNewUser);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /users/onboarding", function () {
    it("Should get all the user with ONBOARDING state and are present in discord server for more than 31 days", function (done) {
      chai
        .request(app)
        .get("/users/onboarding")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.totalUsers).to.be.a("number");
          expect(res.body.message).to.equal("All User found successfully.");
          expect(res.body.allUser).to.be.a("array");
          res.body.allUser.forEach((status) => {
            expect(status).to.have.property("discordJoinedAt");
            expect(status).to.have.property("currentStatus");
          });
          return done();
        });
    });
  });
});
