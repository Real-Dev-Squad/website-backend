const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const profileDiffs = require("../../models/profileDiffs");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const profileDiffData = require("../fixtures/profileDiffs/profileDiffs")();
const superUser = userData[4];

const config = require("config");
const joinData = require("../fixtures/user/join");
const { addJoinData } = require("../../models/users");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Users", function () {
  let jwt;
  let superUserId;
  let superUserAuthToken;
  let userId = "";

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("PATCH /users/self", function () {
    it("Should update the user", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          first_name: "Test first_name",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(204);

          return done();
        });
    });

    it("Should update the user status", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          status: "ooo",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(204);

          return done();
        });
    });

    it("Should return 400 for invalid status value", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          status: "blah",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 400,
            error: "Bad Request",
            message: '"status" must be one of [ooo, idle, active]',
          });

          return done();
        });
    });
  });

  describe("GET /users", function () {
    it("Should get all the users in system", function (done) {
      chai
        .request(app)
        .get("/users")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users[0]).to.not.have.property("phone");
          expect(res.body.users[0]).to.not.have.property("email");

          return done();
        });
    });
  });

  describe("GET /users/self", function () {
    it("Should return the logged user's details", function (done) {
      chai
        .request(app)
        .get("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body).to.not.have.property("phone");
          expect(res.body).to.not.have.property("email");

          return done();
        });
    });

    it("Should return details with phone and email when query 'private' is true", function (done) {
      chai
        .request(app)
        .get("/users/self")
        .query({ private: true })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body).to.have.property("phone");
          expect(res.body).to.have.property("email");

          return done();
        });
    });

    it("Should return 401 if not logged in", function (done) {
      chai
        .request(app)
        .get("/users/self")
        .end((err, res) => {
          if (err) {
            return done();
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
  });

  describe("GET /users/id", function () {
    it("Should return one user with given id", function (done) {
      chai
        .request(app)
        .get(`/users/${userData[0].username}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User returned successfully!");
          expect(res.body.user).to.be.a("object");
          expect(res.body.user).to.not.have.property("phone");
          expect(res.body.user).to.not.have.property("email");

          return done();
        });
    });

    it("Should return 404 if there is no user in the system", function (done) {
      chai
        .request(app)
        .get("/users/invalidUser")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User doesn't exist");

          return done();
        });
    });
  });

  describe("GET /users/userId/id", function () {
    it("Should return one user with given id", function (done) {
      chai
        .request(app)
        .get(`/users/userId/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User returned successfully!");
          expect(res.body.user).to.be.a("object");
          return done();
        });
    });

    it("Should return 404 if there is no user in the system", function (done) {
      chai
        .request(app)
        .get("/users/userId/invalidUserId")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User doesn't exist");

          return done();
        });
    });
  });

  describe("GET /users/isUsernameAvailable/username", function () {
    it("Should return isUsernameAvailable as true as we are passing new user", function (done) {
      chai
        .request(app)
        .get("/users/isUsernameAvailable/availableUser")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.isUsernameAvailable).to.equal(true);

          return done();
        });
    });

    it("Should return isUsernameAvailable as false as we are passing existing user", function (done) {
      chai
        .request(app)
        .get(`/users/isUsernameAvailable/${userData[0].username}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.isUsernameAvailable).to.equal(false);

          return done();
        });
    });
  });

  describe("GET /users/:userId/intro", function () {
    beforeEach(async function () {
      await addJoinData(joinData(userId)[0]);
    });
    it("Should return data of the given username", function (done) {
      chai
        .request(app)
        .get(`/users/${userId}/intro`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User data returned");
          return done();
        });
    });
    it("Should return 404 if user not Found", function (done) {
      chai
        .request(app)
        .get(`/users/ritiksuserId/intro`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          return done();
        });
    });
    it("Should return 401 is not Logged In", function (done) {
      chai
        .request(app)
        .get(`/users/${userId}/intro`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });
  });

  describe("POST /users/self/intro", function () {
    it("Should store the info in db", function (done) {
      chai
        .request(app)
        .post(`/users/self/intro`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(joinData()[2])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User Data Added Succesfully");
          return done();
        });
    });

    it("Should return 401 for unauthorized request", function (done) {
      chai
        .request(app)
        .post(`/users/self/intro`)
        .set("Cookie", `${cookieName}=""`)
        .send(joinData()[2])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          return done();
        });
    });

    it("Should return 400 for invalid Data", function (done) {
      chai
        .request(app)
        .post(`/users/self/intro`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(joinData()[1])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.be.equal('"firstName" is required');
          return done();
        });
    });
  });

  describe("PATCH /users/rejectDiff", function () {
    let profileDiffsId;
    beforeEach(async function () {
      profileDiffsId = await profileDiffs.add({ userId, ...profileDiffData[0] });
    });
    it("Should update reject the profileDiff specified, using authorized user (super_user)", function (done) {
      chai
        .request(app)
        .patch(`/users/rejectDiff`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          profileDiffId: `${profileDiffsId}`,
          message: "",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Profile Diff Rejected successfully!");
          return done();
        });
    });

    it("Should return unauthorized error when not authorized", function (done) {
      chai
        .request(app)
        .patch(`/users/rejectDiff`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("You are not authorized for this action.");
          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .patch(`/users/rejectDiff`)
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

  describe("PATCH /users/:userId", function () {
    let profileDiffsId;
    beforeEach(async function () {
      profileDiffsId = await profileDiffs.add({ userId, ...profileDiffData[0] });
    });
    it("Should update the user profile with latest pending profileDiffs, using authorized user (super_user)", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          id: `${profileDiffsId}`,
          first_name: "Ankur",
          last_name: "Narkhede",
          yoe: 0,
          company: "",
          designation: "AO",
          github_id: "ankur1337",
          linkedin_id: "ankurnarkhede",
          twitter_id: "ankur909",
          instagram_id: "",
          website: "",
          message: "",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Updated user's data successfully!");
          return done();
        });
    });

    it("Should return unauthorized error when not authorized", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("You are not authorized for this action.");
          return done();
        });
    });

    it("Should return unauthorized error when not logged in", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}`)
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

  describe("GET /users/chaincode", function () {
    it("Should save the userId and timestamp in firestore collection and return the document ID as chaincode in response", function (done) {
      chai
        .request(app)
        .get("/users/chaincode")
        .set("cookie", `${cookieName}=${jwt}`)
        .end(async (err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Chaincode returned successfully");
          expect(res.body.chaincode).to.be.a("string");
          return done();
        });
    });

    it("Should return 401 if user not logged in", function (done) {
      chai
        .request(app)
        .get("/users/chaincode")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });
  });

  describe("PATCH /users/profileURL", function () {
    it("Should update the profileURL", function (done) {
      chai
        .request(app)
        .patch("/users/profileURL")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          profileURL: "http://localhost:3000/healthcheck",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("updated profile URL!!");
          return done();
        });
    });
    it("Should return 400 for invalid profileURL value", function (done) {
      chai
        .request(app)
        .patch("/users/profileURL")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          profileURL: "random",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 400,
            error: "Bad Request",
            message: '"profileURL" must be a valid uri',
          });

          return done();
        });
    });
    it("Should return 400 for no profileURL value", function (done) {
      chai
        .request(app)
        .patch("/users/profileURL")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({})
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 400,
            error: "Bad Request",
            message: '"profileURL" is required',
          });
          return done();
        });
    });
  });

  describe("POST /users/verify", function () {
    it("Should queue the Request", function (done) {
      chai
        .request(app)
        .post("/users/verify")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Your request has been queued successfully");
          return done();
        });
    });

    it("Should return 401 if the user is not logged in", function (done) {
      chai
        .request(app)
        .post("/users/verify")
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });
  });
});
