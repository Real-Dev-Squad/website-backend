const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const firestore = require("../../utils/firestore");
const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const profileDiffs = require("../../models/profileDiffs");
const cleanDb = require("../utils/cleanDb");
// Import fixtures
const userData = require("../fixtures/user/user")();
const tasksData = require("../fixtures/tasks/tasks")();
const profileDiffData = require("../fixtures/profileDiffs/profileDiffs")();
const superUser = userData[4];
const searchParamValues = require("../fixtures/user/search")();

const config = require("config");
const discordDeveloperRoleId = config.get("discordDeveloperRoleId");
const { getDiscordMembers } = require("../fixtures/discordResponse/discord-response");
const joinData = require("../fixtures/user/join");
const {
  userStatusDataForNewUser,
  userStatusDataAfterSignup,
  userStatusDataAfterFillingJoinSection,
} = require("../fixtures/userStatus/userStatus");
const { addJoinData, addOrUpdate } = require("../../models/users");
const userStatusModel = require("../../models/userStatus");
const { MAX_USERNAME_LENGTH } = require("../../constants/users.ts");
const { TASK_STATUS } = require("../../constants/tasks");
const userRoleUpdate = userData[4];
const userRoleUnArchived = userData[13];
const userAlreadyMember = userData[0];
const userAlreadyNotMember = userData[13];
const userAlreadyArchived = userData[5];
const userAlreadyUnArchived = userData[4];
const nonSuperUser = userData[0];
const newUser = userData[18];
const newUser2 = userData[3];
const userWithRole = userData[4];
const cookieName = config.get("userToken.cookieName");
const { userPhotoVerificationData } = require("../fixtures/user/photo-verification");
const Sinon = require("sinon");
const { INTERNAL_SERVER_ERROR, SOMETHING_WENT_WRONG } = require("../../constants/errorMessages");
const photoVerificationModel = firestore.collection("photo-verification");
const userModel = firestore.collection("users");
const taskModel = firestore.collection("tasks");
const {
  usersData: abandonedUsersData,
  tasksData: abandonedTasksData,
} = require("../fixtures/abandoned-tasks/departed-users");
const userService = require("../../services/users");
chai.use(chaiHttp);

describe("Users", function () {
  let jwt;
  let superUserId;
  let superUserAuthToken;
  let userId = "";
  let fetchStub;

  beforeEach(async function () {
    userId = await addUser();
    jwt = authService.generateAuthToken({ userId });
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });

    const userDocRef = photoVerificationModel.doc();
    userPhotoVerificationData.userId = userId;
    await userDocRef.set(userPhotoVerificationData);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /users/identity-stats", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
    });

    afterEach(function () {
      Sinon.restore();
    });

    it("Should return when only one user", function (done) {
      chai
        .request(app)
        .get("/users/identity-stats")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.blockedDeveloperCount).to.equal(0);
          expect(res.body.blockedUsersCount).to.equal(1);
          expect(res.body.developersCount).to.equal(0);
          expect(res.body.developersLeftToVerifyCount).to.equal(0);
          expect(res.body.verifiedDeveloperCount).to.equal(0);
          expect(res.body.verifiedUsersCount).to.equal(0);

          return done();
        });
    });

    it("Should return verified and blocked users", async function () {
      await addOrUpdate(userData[0]);
      await addOrUpdate(userData[1]);
      await addOrUpdate(userData[2]);
      await addOrUpdate(userData[3]);

      const res = await chai
        .request(app)
        .get("/users/identity-stats")
        .set("cookie", `${cookieName}=${superUserAuthToken}`);

      expect(res).to.have.status(200);
      expect(res.body.blockedDeveloperCount).to.equal(0);
      expect(res.body.blockedUsersCount).to.equal(2);
      expect(res.body.developersCount).to.equal(0);
      expect(res.body.developersLeftToVerifyCount).to.equal(0);
      expect(res.body.verifiedDeveloperCount).to.equal(0);
      expect(res.body.verifiedUsersCount).to.equal(1);
    });
  });

  describe("PATCH /users/self", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
    });

    afterEach(function () {
      Sinon.restore();
    });

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

    it("should update the username when valid username is provided and dev is false", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch("/users/self")
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            username: "testUserName",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(204);

            return done();
          });
      });
    });

    it("Should update the username when dev is true and role,firstName and lastName are given", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch("/users/self?dev=true")
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            role: "developer",
            first_name: "Test",
            last_name: "User",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(204);

            return done();
          });
      });
    });

    it("Should not update the username when role is not present and dev is true", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/self?dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            first_name: "Test",
            last_name: "User",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should not update the username first_name is not present", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/self?dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            last_name: "User",
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should not update the username when last_name is not present and dev is true", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/self?dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            first_name: "Test",
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should not update the username incompleteUserDetails is false and dev is true", function (done) {
      addUser(newUser2).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/self?dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            first_name: "Test",
            last_name: "User",
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(204);
            return done();
          });
      });
    });

    it("Should not update the user roles when user already has a role", function (done) {
      addUser(userWithRole).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch("/users/self?dev=true")
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(403);
            return done();
          });
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

          return done();
        });
    });

    it("Should return 400 if invalid role", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          role: "invalidRole",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);

          return done();
        });
    });

    it("Should update the social id with valid social id", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          twitter_id: "Valid_twitterId",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(204);
          return done();
        });
    });

    it("Should return 400 for invalid Twitter ID", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          twitter_id: "invalid@twitter_id",
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
            message: "Invalid Twitter ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });

    it("Should return 400 for invalid Linkedin ID", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          linkedin_id: "invalid@linkedin_id",
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
            message: "Invalid Linkedin ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });

    it("Should return 400 for invalid instagram ID", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          instagram_id: "invalid@instagram_id",
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
            message: "Invalid Instagram ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });

    it("Should return 400 is space is included in the social ID", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          linkedin_id: "Linkedin 123",
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
            message: "Invalid Linkedin ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });
  });

  describe("GET /users", function () {
    let userWithOverdueApprovedTask;

    beforeEach(async function () {
      const { userId } = await addOrUpdate(userData[0]);
      await userStatusModel.updateUserStatus(userId, userStatusDataForNewUser);
      await addOrUpdate(userData[1]);
      await addOrUpdate(userData[2]);
      await addOrUpdate(userData[3]);

      const assigneeData = { ...userData[6], discordId: getDiscordMembers[0].user.id };
      userWithOverdueApprovedTask = await addUser(assigneeData);
      await taskModel.add({ ...tasksData[0], assignee: userWithOverdueApprovedTask, status: TASK_STATUS.APPROVED });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Should get all the users in system", function (done) {
      chai
        .request(app)
        .get("/users")
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
          expect(res.body.users[0]).to.not.have.property("chaincode");

          return done();
        });
    });

    it("Should get all the users with archived false", function (done) {
      chai
        .request(app)
        .get("/users")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          const userData = res.body.users;
          userData.forEach((user) => {
            expect(user.roles.archived).to.equal(false);
          });
          expect(res.body.users[0]).to.not.have.property("phone");
          expect(res.body.users[0]).to.not.have.property("email");
          expect(res.body.users[0]).to.not.have.property("chaincode");
          return done();
        });
    });

    it("Should get all the users in system when query params are valid", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({
          size: 1,
          page: 0,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users[0]).to.not.have.property("phone");
          expect(res.body.users[0]).to.not.have.property("email");
          expect(res.body.users[0]).to.not.have.property("chaincode");
          return done();
        });
    });

    it("Should return 400 bad request when query params are invalid", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({
          size: -1,
          page: -1,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("size must be in range 1-100");
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return 400 bad request when query param size is invalid", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({
          size: 101,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("size must be in range 1-100");
          expect(res.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return next and prev links", function (done) {
      chai
        .request(app)
        .get("/users?size=2")
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body).to.have.property("links");
          expect(res.body.links).to.have.property("next");
          expect(res.body.links).to.have.property("prev");

          return done();
        });
    });

    it("Should return 400 when both prev and next passed as query param", function (done) {
      chai
        .request(app)
        .get(`/users?next=${userId}&prev=${userId}&size=2`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Both prev and next can't be passed");

          return done();
        });
    });

    it("Should return 400 when both page and next passed as query param", function (done) {
      chai
        .request(app)
        .get(`/users?next=${userId}&page=1&size=2`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Both page and next can't be passed");

          return done();
        });
    });

    it("Should return 400 when both page and prev passed as query param", function (done) {
      chai
        .request(app)
        .get(`/users?page=1&prev=${userId}&size=2`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Both page and prev can't be passed");

          return done();
        });
    });

    it("Should include search and size query params in the response links that are passed by the request", function (done) {
      chai
        .request(app)
        .get(`/users?search=an&size=2`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body).to.have.property("links");
          expect(res.body.links).to.have.property("next");
          expect(res.body.links).to.have.property("prev");
          expect(res.body.links.next).includes("search");
          expect(res.body.links.next).includes("size");
          expect(res.body.links.prev).includes("search");
          expect(res.body.links.prev).includes("size");

          return done();
        });
    });

    it("Should not have page param in the response links if passed by the request", function (done) {
      chai
        .request(app)
        .get(`/users?page=1&size=2`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body).to.have.property("links");
          expect(res.body.links).to.have.property("next");
          expect(res.body.links).to.have.property("prev");
          expect(res.body.links.next).to.not.includes("page");
          expect(res.body.links.prev).to.not.includes("page");

          return done();
        });
    });

    it("Should get next and previous page results based upon the links in the response", async function () {
      const response = await chai.request(app).get(`/users?size=2`);
      expect(response).to.have.status(200);
      expect(response.body).to.be.a("object");
      expect(response.body.message).to.equal("Users returned successfully!");
      expect(response.body).to.have.property("links");
      expect(response.body.links).to.have.property("next");
      expect(response.body.links).to.have.property("prev");

      const nextPageLink = response.body.links.next;
      const nextPageResponse = await chai.request(app).get(nextPageLink);

      expect(nextPageResponse).to.have.status(200);
      expect(nextPageResponse.body).to.be.a("object");
      expect(nextPageResponse.body.message).to.equal("Users returned successfully!");
      expect(nextPageResponse.body).to.have.property("links");
      expect(nextPageResponse.body.links).to.have.property("next");
      expect(nextPageResponse.body.links).to.have.property("prev");
      expect(nextPageResponse.body.users).to.have.length(2);

      const prevPageLink = nextPageResponse.body.links.prev;
      const previousPageResponse = await chai.request(app).get(prevPageLink);

      expect(previousPageResponse).to.have.status(200);
      expect(previousPageResponse.body).to.be.a("object");
      expect(previousPageResponse.body.message).to.equal("Users returned successfully!");
      expect(previousPageResponse.body).to.have.property("links");
      expect(previousPageResponse.body.links).to.have.property("next");
      expect(previousPageResponse.body.links).to.have.property("prev");
      expect(previousPageResponse.body.users).to.have.length(2);
    });

    it("Should return 503 if something went wrong if data not fetch from github", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({
          query: "filterBy:unmerged_prs+days:30",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(503);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal(SOMETHING_WENT_WRONG);
          return done();
        });
    });

    it("Should return 503 if something went wrong if data not fetch from github for new query format under feature flag", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({
          q: "filterBy:unmerged_prs+days:30",
          dev: true,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(503);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal(SOMETHING_WENT_WRONG);
          return done();
        });
    });

    it("Should throw an error when there is no feature flag when using the new query parameter format(q)", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({
          q: "filterBy:unmerged_prs+days:30",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Route not found");
          return done();
        });
    });

    it("Should return 400 if days is not passed for filterBy unmerged_prs", function (done) {
      chai
        .request(app)
        .get("/users?query=filterBy:unmerged_prs")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Days is required for filterBy unmerged_prs");
          return done();
        });
    });

    it("Should return 400 if days is not passed for filterBy unmerged_prs with new query format and feature flag", function (done) {
      chai
        .request(app)
        .get("/users?q=filterBy:unmerged_prs&dev=true")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Days is required for filterBy unmerged_prs");
          return done();
        });
    });

    it("Should return one user with given discord id and feature flag", async function () {
      const discordId = userData[0].discordId;

      const res = await chai.request(app).get(`/users?dev=true&discordId=${discordId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("object");
      expect(res.body.user).to.have.property("state");
    });

    it("Should throw an error when there is no feature flag", async function () {
      const discordId = userData[0].discordId;
      const res = await chai.request(app).get(`/users?discordId=${discordId}`).set("cookie", `${cookieName}=${jwt}`);
      expect(res).to.have.status(404);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.equal("Route not found");
    });

    it("Should return an empty object when passing an invalid Discord ID", async function () {
      const invalidDiscordId = "50485556209423";
      const res = await chai.request(app).get(`/users?dev=true&discordId=${invalidDiscordId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.equal("User not found");
    });

    it("should return users who have overdue tasks with APPROVED status", function (done) {
      chai
        .request(app)
        .get("/users?query=filterBy:overdue_tasks")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.users).to.be.an("array");
          expect(res.body.users.length).to.equal(1);
          expect(res.body.users[0].id).to.equal(userWithOverdueApprovedTask);

          return done();
        });
    });

    it("Should return user ID(s) with overdue tasks within the last 1 day", function (done) {
      chai
        .request(app)
        .get("/users?query=filterBy:overdue_tasks+days:1")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.users).to.be.an("array");

          return done();
        });
    });

    it("Should return user id which have overdue tasks with new query params under feature flag", function (done) {
      chai
        .request(app)
        .get("/users?q=filterBy:overdue_tasks+days:1&dev=true")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body.users).to.be.an("array");

          return done();
        });
    });

    it("Should return the logged-in user's details when profile is true", function (done) {
      chai
        .request(app)
        .get("/users?profile=true")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body).to.not.have.property("phone");
          expect(res.body).to.not.have.property("email");
          expect(res.body).to.not.have.property("chaincode");

          return done();
        });
    });

    it("Should return 401 if not logged in", function (done) {
      chai
        .request(app)
        .get("/users?profile=true")
        .set("cookie", `${cookieName}=invalid_token`)
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

    it("Should return users filtered by profile status", function (done) {
      chai
        .request(app)
        .get("/users?profileStatus=BLOCKED")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users with profile status BLOCKED returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.count).to.be.a("number");

          res.body.users.forEach((user) => {
            expect(user.profileStatus).to.equal("BLOCKED");
          });

          return done();
        });
    });

    it("Should return empty array when no users with specified profile status", function (done) {
      chai
        .request(app)
        .get("/users?profileStatus=NON_EXISTENT_STATUS")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users with profile status NON_EXISTENT_STATUS returned successfully!");
          expect(res.body.users).to.be.a("array");
          expect(res.body.count).to.equal(0);
          expect(res.body.users).to.have.length(0);

          return done();
        });
    });

    it("Should accept lowercase profileStatus", function (done) {
      chai
        .request(app)
        .get("/users?profileStatus=blocked")
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.users).to.be.a("array");
          res.body.users.forEach((user) => {
            expect(user.profileStatus).to.equal("BLOCKED");
          });
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
          expect(res.body).to.not.have.property("chaincode");
          expect(res).to.have.header(
            "X-Deprecation-Warning",
            "WARNING: This endpoint is deprecated and will be removed in the future. Please use /users?profile=true to get the updated profile details."
          );

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
          expect(res.body.user).to.not.have.property("chaincode");
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
          expect(res.body.user).to.not.have.property("phone");
          expect(res.body.user).to.not.have.property("email");
          expect(res.body.user).to.not.have.property("chaincode");
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

  describe("GET /users/username", function () {
    const firstname = "shubham";
    const lastname = "sigdar";

    it("Should return unique username when passing firstname and lastname", function (done) {
      addUser(userData[15]).then((availableUsernameUserId) => {
        const userJwt = authService.generateAuthToken({ userId: availableUsernameUserId });
        chai
          .request(app)
          .get(`/users/username?firstname=${firstname}&lastname=${lastname}&dev=true`)
          .set("cookie", `${cookieName}=${userJwt}`)
          .end((err, res) => {
            if (err) {
              return done();
            }
            expect(res).to.have.status(200);
            expect(res.body).to.be.a("object");
            expect(res.body.username).to.equal("shubham-sigdar-2");

            return done();
          });
      });
    });

    it("Should return 404 if feature flag is not pass", function (done) {
      chai
        .request(app)
        .get(`/users/username?firstname=${firstname}&lastname=${lastname}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(404);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("UserName Not Found");

          return done();
        });
    });

    it("Should return 400 for empty firstname and lastname", function (done) {
      chai
        .request(app)
        .get(`/users/username?firstname=&lastname=&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Invalid Query Parameters Passed");

          return done();
        });
    });

    it("Should handle long names and truncate them to fit within the max length", function (done) {
      const longFirstname = "ChristopherJonathan";
      const longLastname = "MontgomeryWellington";

      chai
        .request(app)
        .get(`/users/username?firstname=${longFirstname}&lastname=${longLastname}&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.username).to.have.lengthOf.at.most(MAX_USERNAME_LENGTH);
          return done();
        });
    });

    it("Should return 400 if firstname or lastname is missing", function (done) {
      chai
        .request(app)
        .get(`/users/username?firstname=${firstname}&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(400);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Invalid Query Parameters Passed");
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

  describe("GET /users/?id", function () {
    afterEach(async function () {
      await cleanDb();
    });

    it("Should return given user by id", async function () {
      const { userId } = await addOrUpdate(userData[0]);
      const res = await chai.request(app).get(`/users/?id=${userId}`);
      expect(res).to.have.status(200);
      expect(res.body).to.be.a("object");
      expect(res.body.message).to.equal("User returned successfully!");
      expect(res.body.user).to.be.a("object");
      expect(Object.keys(res.body.user)).to.include.members([
        "username",
        "first_name",
        "last_name",
        "yoe",
        "linkedin_id",
        "github_id",
        "isMember",
        "roles",
      ]);
      expect(Object.keys(res.body.user)).to.not.include.members(["phone", "email", "tokens", "chaincode"]);
      expect(res.body.user.id).to.equal(userId);
    });

    it("Should return 404 if user not Found", function (done) {
      chai
        .request(app)
        .get(`/users/?id=anyRandomuserId`)
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

  describe("GET /users?search", function () {
    beforeEach(async function () {
      await addOrUpdate(userData[0]);
      await addOrUpdate(userData[7]);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Should return users successfully", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: searchParamValues.an })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");

          return done();
        });
    });

    it("Should return users successfully converting search param value to small case", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: searchParamValues.AN })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          res.body.users.forEach((user) => {
            expect(user.username.slice(0, 2)).to.equal(searchParamValues.AN.toLowerCase());
          });
          return done();
        });
    });

    it("Should return 400 for empty value of search param", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: searchParamValues.null })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(400);

          return done();
        });
    });

    it("Should return users of username starting with '23' with response status code 200", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: searchParamValues.number23 })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          res.body.users.forEach((user) => {
            expect(user.username.slice(0, 2)).to.equal(`${searchParamValues.number23}`);
          });
          return done();
        });
    });

    it("Should return users with first name 'Ankur' successfully", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: "Ankur", dev: true }) // Search for users with first name 'Ankur' in dev mode
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          return done();
        });
    });

    it("Should return users with last name 'Narkhede' successfully", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: "Narkhede", dev: true })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");
          expect(res.body.users).to.be.a("array");
          return done();
        });
    });

    it("Should return an empty array with response status code 200", function (done) {
      chai
        .request(app)
        .get("/users")
        .query({ search: searchParamValues.mu })
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Users returned successfully!");

          return done();
        });
    });
  });

  describe("GET /users?departed", function () {
    beforeEach(async function () {
      await cleanDb();
      const userPromises = abandonedUsersData.map((user) => userModel.doc(user.id).set(user));
      await Promise.all(userPromises);

      const taskPromises = abandonedTasksData.map((task) => taskModel.add(task));
      await Promise.all(taskPromises);
    });

    afterEach(async function () {
      Sinon.restore();
      await cleanDb();
    });

    it("should return a list of users with abandoned tasks", async function () {
      const res = await chai.request(app).get("/users?dev=true&departed=true");
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message").that.equals("Users with abandoned tasks fetched successfully");
      expect(res.body).to.have.property("users").to.be.an("array").with.lengthOf(2);
    });

    it("should return an empty array when no users have abandoned tasks", async function () {
      await cleanDb();
      const user = abandonedUsersData[2];
      await userModel.add(user);

      const task = abandonedTasksData[3];
      await taskModel.add(task);
      const res = await chai.request(app).get("/users?dev=true&departed=true");

      expect(res).to.have.status(204);
    });

    it("should fail if dev flag is not passed", async function () {
      const res = await chai.request(app).get("/users?departed=true");
      expect(res).to.have.status(404);
      expect(res.body.message).to.be.equal("Route not found");
    });

    it("should handle errors gracefully if getUsersWithIncompleteTasks fails", async function () {
      Sinon.stub(userService, "getUsersWithIncompleteTasks").rejects(new Error(INTERNAL_SERVER_ERROR));

      const res = await chai.request(app).get("/users?departed=true&dev=true");

      expect(res).to.have.status(500);
      expect(res.body.message).to.be.equal(INTERNAL_SERVER_ERROR);
    });
  });

  describe("PUT /users/self/intro", function () {
    let userStatusData;

    beforeEach(async function () {
      await userStatusModel.updateUserStatus(userId, userStatusDataAfterSignup);
      const updateStatus = await userStatusModel.updateUserStatus(userId, userStatusDataAfterFillingJoinSection);
      userStatusData = (await firestore.collection("usersStatus").doc(updateStatus.id).get()).data();
    });

    it("should return 409 if the data already present", function (done) {
      addJoinData(joinData(userId)[3]);
      chai
        .request(app)
        .put(`/users/self/intro`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(joinData(userId)[3])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(409);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User data is already present!");
          return done();
        });
    });

    it("Should store the info in db", function (done) {
      chai
        .request(app)
        .put(`/users/self/intro`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(joinData()[2])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User join data and newstatus data added and updated successfully");
          expect(userStatusData).to.have.own.property("currentStatus");
          expect(userStatusData).to.have.own.property("monthlyHours");
          expect(userStatusData.currentStatus.state).to.equal("ONBOARDING");
          expect(userStatusData.monthlyHours.committed).to.equal(40);
          return done();
        });
    });

    it("Should return 401 for unauthorized request", function (done) {
      chai
        .request(app)
        .put(`/users/self/intro`)
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
        .put(`/users/self/intro`)
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

  describe("PUT /users/:userId/intro", function () {
    let userStatusData;

    beforeEach(async function () {
      await userStatusModel.updateUserStatus(userId, userStatusDataAfterSignup);
      const updateStatus = await userStatusModel.updateUserStatus(userId, userStatusDataAfterFillingJoinSection);
      userStatusData = (await firestore.collection("usersStatus").doc(updateStatus.id).get()).data();
    });

    it("should return 409 if the data already present", function (done) {
      addJoinData(joinData(userId)[3]);
      chai
        .request(app)
        .put(`/users/${userId}/intro?dev=true`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(joinData(userId)[3])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(409);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User data is already present!");
          return done();
        });
    });

    it("Should store the info in db", function (done) {
      chai
        .request(app)
        .put(`/users/${userId}/intro?dev=true`)
        .set("Cookie", `${cookieName}=${jwt}`)
        .send(joinData()[2])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(201);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User join data and newstatus data added and updated successfully");
          expect(userStatusData).to.have.own.property("currentStatus");
          expect(userStatusData).to.have.own.property("monthlyHours");
          expect(userStatusData.currentStatus.state).to.equal("ONBOARDING");
          expect(userStatusData.monthlyHours.committed).to.equal(40);
          return done();
        });
    });

    it("Should return 401 for Unauthenticated User Request", function (done) {
      chai
        .request(app)
        .put(`/users/${userId}/intro?dev=true`)
        .set("Cookie", `${cookieName}=""`)
        .send(joinData()[2])
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Unauthenticated User");
          return done();
        });
    });

    it("Should return 400 for invalid Data", function (done) {
      chai
        .request(app)
        .put(`/users/${userId}/intro?dev=true`)
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

    it("Should return 403 for Forbidden access", function (done) {
      const userId = "anotherUser123";
      addJoinData(joinData(userId)[3]);

      chai
        .request(app)
        .put(`/users/${userId}/intro?dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send(joinData(userId)[3])
        .end((err, res) => {
          if (err) return done(err);

          expect(res).to.have.status(403);
          expect(res.body).to.be.an("object");
          expect(res.body.message).to.equal("Unauthorized access");
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

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          expect(res.body.message).to.be.equal("Invalid Request.");
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

  describe("PATCH /users/:userId?profile=true", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("Should update the user", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          first_name: "Test",
          last_name: "User",
          role: "developer",
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
        .patch(`/users/${userId}?profile=true`)
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

    it("Should not update the user when dev is true and role is not present", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/${newUserId}?profile=true&dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            first_name: "Test",
            last_name: "User",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should not update the user when first_name is not present and dev is true", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/${newUserId}?profile=true&dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            last_name: "User",
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should not update the user when last_name is not present and dev is true", function (done) {
      addUser(newUser).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/${newUserId}?profile=true&dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            first_name: "Test",
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should not update the user roles when user already has a role", function (done) {
      addUser(userWithRole).then((newUserId) => {
        const newUserJwt = authService.generateAuthToken({ userId: newUserId });
        chai
          .request(app)
          .patch(`/users/${newUserId}?profile=true&dev=true`)
          .set("cookie", `${cookieName}=${newUserJwt}`)
          .send({
            role: "developer",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(403);
            return done();
          });
      });
    });

    it("Should return 400 for invalid status value", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
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
            message: '"status" must be one of [ooo, idle, active, onboarding]',
          });

          return done();
        });
    });

    it("Should return 400 if required roles is missing", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          roles: {
            in_discord: false,
            developer: true,
          },
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);

          return done();
        });
    });

    it("Should return 400 if invalid roles", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          roles: {
            archived: "false",
            in_discord: false,
            developer: true,
          },
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);

          return done();
        });
    });

    it("Should update the social id with valid social id", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          twitter_id: "Valid_twitterId",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(204);
          return done();
        });
    });

    it("Should return 400 for invalid Twitter ID", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          twitter_id: "invalid@twitter_id",
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
            message: "Invalid Twitter ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });

    it("Should return 400 for invalid Linkedin ID", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          linkedin_id: "invalid@linkedin_id",
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
            message: "Invalid Linkedin ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });

    it("Should return 400 for invalid instagram ID", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          instagram_id: "invalid@instagram_id",
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
            message: "Invalid Instagram ID. ID should not contain special character @ or spaces",
          });

          return done();
        });
    });

    it("Should return 400 is space is included in the social ID", function (done) {
      chai
        .request(app)
        .patch(`/users/${userId}?profile=true&dev=true`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          linkedin_id: "Linkedin 123",
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
            message: "Invalid Linkedin ID. ID should not contain special character @ or spaces",
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

  describe("PATCH /users/picture/verify/id", function () {
    it("Should verify the discord image of the user", function (done) {
      chai
        .request(app)
        .patch(`/users/picture/verify/${userId}?type=discord`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("discord image was verified successfully!");
          return done();
        });
    });

    it("Should throw for wrong query while verifying the discord image of the user", function (done) {
      chai
        .request(app)
        .patch(`/users/picture/verify/${userId}?type=RANDOM`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal("Invalid verification type was provided!");
          return done();
        });
    });
  });

  describe("GET /users/picture/id", function () {
    it("Should get the user's verification record", function (done) {
      chai
        .request(app)
        .get(`/users/picture/${userId}`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.data).to.deep.equal(userPhotoVerificationData);
          expect(res.body.message).to.equal("User image verification record fetched successfully!");
          return done();
        });
    });

    it("Should throw error if no user's verification record was found", function (done) {
      chai
        .request(app)
        .get("/users/picture/some-unknown-user-id")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          expect(res.body.message).to.equal("An internal server error occurred");
          return done();
        });
    });
  });

  describe("POST /update-in-discord", function () {
    it("it returns proper response", function (done) {
      chai
        .request(app)
        .post("/users/update-in-discord")
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Successfully added the in_discord field to false for all users");
          return done();
        });
    });
  });

  describe("POST /", function () {
    let fetchStub;

    beforeEach(async function () {
      fetchStub = Sinon.stub(global, "fetch");
    });

    afterEach(async function () {
      Sinon.restore();
      await cleanDb();
    });

    it("tests adding unverified role to user", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
      chai
        .request(app)
        .post("/users")
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(fetchStub.calledOnce).to.be.equal(true);
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("ROLES APPLIED SUCCESSFULLY");
          return done();
        });
    });

    it("Gives internal server error", function (done) {
      fetchStub.throws(new Error("OOps"));
      chai
        .request(app)
        .post("/users")
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          expect(res.body.message).to.be.equal(INTERNAL_SERVER_ERROR);
          return done();
        });
    });
  });

  describe("PATCH /users/:id/temporary/data", function () {
    it("Should make the user a member", function (done) {
      addUser(userRoleUpdate).then((userRoleUpdateId) => {
        chai
          .request(app)
          .patch(`/users/${userRoleUpdateId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            member: true,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.be.equal("role updated successfully!");
            return done();
          });
      });
    });

    it("Should make the member a user", function (done) {
      addUser(userRoleUpdate).then((userRoleUpdateId) => {
        chai
          .request(app)
          .patch(`/users/${userRoleUpdateId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            member: false,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.be.equal("role updated successfully!");
            return done();
          });
      });
    });

    it("Should archive the user", function (done) {
      addUser(userRoleUpdate).then((userRoleUpdateId) => {
        chai
          .request(app)
          .patch(`/users/${userRoleUpdateId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            archived: true,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.be.equal("role updated successfully!");
            return done();
          });
      });
    });

    it("Should un-archive the user", function (done) {
      addUser(userRoleUnArchived).then((userRoleUnArchivedId) => {
        chai
          .request(app)
          .patch(`/users/${userRoleUnArchivedId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            archived: false,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(200);
            expect(res.body.message).to.be.equal("role updated successfully!");
            return done();
          });
      });
    });

    it("Should return 400 if invalid role", function (done) {
      addUser(userRoleUpdate).then((userRoleUpdateId) => {
        chai
          .request(app)
          .patch(`/users/${userRoleUpdateId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            member: true,
            archived: true,
            reason: "test reason",
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.be.equal("we only allow either role member or archived with a reason");
            return done();
          });
      });
    });

    it("Should return 400 if we pass in_discord role", function (done) {
      addUser(userRoleUpdate).then((userRoleUpdateId) => {
        chai
          .request(app)
          .patch(`/users/${userRoleUpdateId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            in_discord: true,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(400);
            expect(res.body.message).to.be.equal("we only allow either role member or archived with a reason");
            return done();
          });
      });
    });

    it("Should return 409 if user is already a member", function (done) {
      addUser(userAlreadyMember).then((userAlreadyMemberId) => {
        chai
          .request(app)
          .patch(`/users/${userAlreadyMemberId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            member: true,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.be.equal("Role already exist!");
            return done();
          });
      });
    });

    it("Should return 409 if user is already not a member", function (done) {
      addUser(userAlreadyNotMember).then((userAlreadyNotMemberId) => {
        chai
          .request(app)
          .patch(`/users/${userAlreadyNotMemberId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            member: false,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.be.equal("Role already exist!");
            return done();
          });
      });
    });

    it("Should return 409 if user is already archived", function (done) {
      addUser(userAlreadyArchived).then((userAlreadyArchivedId) => {
        chai
          .request(app)
          .patch(`/users/${userAlreadyArchivedId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            archived: true,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }

            expect(res).to.have.status(409);
            expect(res.body.message).to.be.equal("Role already exist!");
            return done();
          });
      });
    });

    it("Should return 409 if user is already un-archived", function (done) {
      addUser(userAlreadyUnArchived).then((userAlreadyUnArchivedId) => {
        chai
          .request(app)
          .patch(`/users/${userAlreadyUnArchivedId}/temporary/data`)
          .set("cookie", `${cookieName}=${superUserAuthToken}`)
          .send({
            archived: false,
          })
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            expect(res).to.have.status(409);
            expect(res.body.message).to.be.equal("Role already exist!");
            return done();
          });
      });
    });

    it("Should return 404 if user not found", function (done) {
      chai
        .request(app)
        .patch(`/users/111111111111/temporary/data`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({
          archived: true,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal("User not found");
          return done();
        });
    });

    it("Should return 401 if user is not a super user", function (done) {
      addUser(nonSuperUser).then((nonSuperUserId) => {
        const nonSuperUserJwt = authService.generateAuthToken({ userId: nonSuperUserId });
        chai
          .request(app)
          .patch(`/users/${nonSuperUserId}/temporary/data`)
          .set("cookie", `${cookieName}=${nonSuperUserJwt}`)
          .send({
            archived: true,
          })
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

  describe("PATCH /users", function () {
    let userId1;
    let userId2;
    let userId3;

    beforeEach(async function () {
      const rolesToBeAdded = {
        archived: false,
        in_discord: false,
      };
      userId1 = await addUser({ ...userData[0], roles: rolesToBeAdded });
      userId2 = await addUser({ ...userData[1], roles: rolesToBeAdded });
      userId3 = await addUser({ ...userData[2], roles: rolesToBeAdded });
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("should return 400 if payload is not passed correctly", function (done) {
      chai
        .request(app)
        .patch("/users")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send()
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('Invalid Payload: "action" is required');
          return done();
        });
    });

    it("should returns successful response for api archiveUsersIfNotInDiscord", function (done) {
      chai
        .request(app)
        .patch("/users")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({ action: "archiveUsers" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.summary).to.have.all.keys(["totalUsersArchived", "totalOperationsFailed", "totalUsers"]);
          expect(res.body.summary).to.not.have.property("updatedUserIds");
          expect(res.body.summary.totalUsersArchived).to.be.equal(3);
          expect(res.body.summary.totalUsers).to.be.equal(3);
          expect(res.body.summary.totalOperationsFailed).to.be.equal(0);
          expect(res.body.message).to.equal(
            "Successfully updated users archived role to true if in_discord role is false"
          );
          return done();
        });
    });

    it("should return proper response if no documents are found to update for api archiveUsersIfNotInDiscord", async function () {
      const roles = {
        archived: true,
        in_discord: false,
      };
      await addOrUpdate({ ...userData[0], roles }, userId1);
      await addOrUpdate({ ...userData[1], roles }, userId2);
      await addOrUpdate({ ...userData[2], roles }, userId3);

      const res = await chai
        .request(app)
        .patch("/users")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({ action: "archiveUsers" });

      expect(res).to.have.status(200);
      expect(res.body.summary).to.have.all.keys(["totalUsersArchived", "totalOperationsFailed", "totalUsers"]);
      expect(res.body.summary).to.not.have.property("updatedUserIds");
      expect(res.body.summary.totalUsers).to.be.equal(0);
      expect(res.body.summary.totalUsersArchived).to.be.equal(0);
      expect(res.body.summary.totalOperationsFailed).to.be.equal(0);
      expect(res.body.message).to.equal("Couldn't find any users currently inactive in Discord but not archived.");
    });

    it("should throw an error if firestore batch operations fail for api archiveUsersIfNotInDiscord", async function () {
      const stub = Sinon.stub(firestore, "batch");
      stub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firestore batch commit failed!");
        },
      });

      const res = await chai
        .request(app)
        .patch(`/users`)
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({ action: "archiveUsers" });

      expect(res.status).to.equal(500);
      const response = res.body;
      expect(response.message).to.be.equal("An internal server error occurred");
    });

    it("should return correct response if debug query is passed for api archiveUsersIfNotInDiscord", function (done) {
      chai
        .request(app)
        .patch("/users?debug=true")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send({ action: "archiveUsers" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.summary).to.have.all.keys([
            "totalUsersArchived",
            "totalOperationsFailed",
            "totalUsers",
            "updatedUserDetails",
            "failedUserDetails",
          ]);
          expect(res.body.summary.totalUsersArchived).to.be.equal(3);
          expect(res.body.summary.totalUsers).to.be.equal(3);
          expect(res.body.summary.totalOperationsFailed).to.be.equal(0);
          expect(res.body.summary.updatedUserDetails.length).to.equal(3);
          expect(res.body.summary.failedUserDetails.length).to.equal(0);
          expect(res.body.message).to.equal(
            "Successfully updated users archived role to true if in_discord role is false"
          );
          return done();
        });
    });
  });

  describe("PATCH /:userId/update-nickname", function () {
    beforeEach(async function () {
      fetchStub = Sinon.stub(global, "fetch");
      userId = await addUser(userData[0]);
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("returns 200 for successfully updating nickname with patch method", function (done) {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(),
        })
      );
      chai
        .request(app)
        .patch(`/users/${userId}/update-nickname`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("User nickname changed successfully");
          return done();
        });
    });
  });

  describe("test discord actions of nickname for unverified user", function () {
    beforeEach(async function () {
      fetchStub = Sinon.stub(global, "fetch");
      const superUser = userData[4];
      userId = await addUser(userData[2]);
      superUserId = await addUser(superUser);
      superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("throw error if discordId is not present and user is not verified", function (done) {
      fetchStub.returns({
        update: function () {},
        commit: function () {
          throw new Error("User not verified");
        },
      });
      chai
        .request(app)
        .patch(`/users/${userId}/update-nickname`)
        .set("Cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res).to.have.status(500);
          const response = res.body;
          expect(response.message).to.be.equal("An internal server error occurred");
          return done();
        });
    });
  });

  describe("GET /users/isDeveloper for developers not in_discord", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(getDiscordMembers),
        })
      );
    });

    afterEach(function () {
      Sinon.restore();
    });

    it("Should return false if user is a developer and not in discord", function (done) {
      chai
        .request(app)
        .get("/users/isDeveloper")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.developerRoleExistsOnUser).to.equal(false);

          return done();
        });
    });
  });

  describe("PATCH /users/self for developers", function () {
    let id, jwtoken;

    beforeEach(async function () {
      id = await addUser(userData[0]);
      jwtoken = authService.generateAuthToken({ userId: id });
      fetchStub = Sinon.stub(global, "fetch");
      const discordMembers = [...getDiscordMembers];
      discordMembers[0].user.id = "12345";
      discordMembers[0].roles.push(discordDeveloperRoleId);
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(discordMembers),
        })
      );
    });

    afterEach(function () {
      cleanDb();
      Sinon.restore();
    });

    it("Should not update the user if user is a developer", function (done) {
      chai
        .request(app)
        .patch("/users/self")
        .set("cookie", `${cookieName}=${jwtoken}`)
        .send({
          first_name: "Test first_name",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body.message).to.equal(
            "Developers can only update disabled_roles. Use profile service for updating other attributes."
          );

          return done();
        });
    });

    it("Should return 200 when disabled_roles is being set to [super_user] in userObject ", async function () {
      const res = await chai
        .request(app)
        .patch("/users/self?dev=true")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          disabledRoles: ["super_user"],
        });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.eql({
        message: "Privilege modified successfully!",
        disabled_roles: ["super_user"],
      });

      const res2 = await chai.request(app).get("/users/self").set("cookie", `${cookieName}=${jwt}`);

      expect(res2).to.have.status(200);
      expect(res2.body).to.be.an("object");
      expect(res2.body.roles.super_user).to.be.equal(false);
    });

    it("Should return 200 when disabled_roles is being set to [super_user, member] in userObject", async function () {
      const res = await chai
        .request(app)
        .patch("/users/self?dev=true")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          disabledRoles: ["super_user", "member"],
        });

      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.eql({
        message: "Privilege modified successfully!",
        disabled_roles: ["super_user", "member"],
      });

      const res2 = await chai.request(app).get("/users/self").set("cookie", `${cookieName}=${jwt}`);

      expect(res2).to.have.status(200);
      expect(res2.body).to.be.an("object");
      expect(res2.body.roles.super_user).to.be.equal(false);
      expect(res2.body.roles.member).to.be.equal(false);
    });

    it("Should return 200 when disabled_roles is being set to [], member in userObject", async function () {
      const res = await chai.request(app).patch("/users/self?dev=true").set("cookie", `${cookieName}=${jwt}`).send({
        disabledRoles: [],
      });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object");
      expect(res.body).to.eql({
        message: "Privilege modified successfully!",
        disabled_roles: [],
      });

      const res2 = await chai.request(app).get("/users/self").set("cookie", `${cookieName}=${jwt}`);

      expect(res2).to.have.status(200);
      expect(res2.body).to.be.an("object");
      expect(res2.body.roles.member).to.be.equal(true);
    });

    it("Should return 403 when disabled_roles is being set to [], member in userObject without the dev flag", async function () {
      const res = await chai.request(app).patch("/users/self").set("cookie", `${cookieName}=${jwt}`).send({
        disabledRoles: [],
      });
      expect(res).to.have.status(403);
      expect(res.body.message).to.equal(
        "Developers can only update disabled_roles. Use profile service for updating other attributes."
      );
    });

    it("Should return 404 when disabled_roles is being set to [], but discord reponds with an error", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ error: "🚫 Bad Request Signature" }),
        })
      );
      const res = await chai.request(app).patch("/users/self").set("cookie", `${cookieName}=${jwt}`).send({
        disabledRoles: [],
      });
      expect(res).to.have.status(404);
      expect(res.body.message).to.equal("Error Fetching Members From Discord");
    });

    it("Should return 400 when disabled_roles is being set to ['admin'], member in userObject", async function () {
      const res = await chai
        .request(app)
        .patch("/users/self?dev=true")
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          disabledRoles: ["admin"],
        });
      expect(res).to.have.status(400);
      expect(res.body).to.be.an("object");
      expect(res.body).to.eql({
        statusCode: 400,
        error: "Bad Request",
        message: '"disabledRoles[0]" must be one of [super_user, member]',
      });
    });
  });

  describe("GET /users/isDeveloper for developers", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
      const discordMembers = [...getDiscordMembers];
      discordMembers[0].user.id = "12345";
      discordMembers[0].roles.push(discordDeveloperRoleId);
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(discordMembers),
        })
      );
    });

    afterEach(function () {
      Sinon.restore();
    });

    it("Should return true if user is a developer", function (done) {
      chai
        .request(app)
        .get("/users/isDeveloper")
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.developerRoleExistsOnUser).to.equal(true);

          return done();
        });
    });
  });

  describe("POST USERS MIGRATION", function () {
    it("should run the migration and update usernames successfully", async function () {
      const res = await chai
        .request(app)
        .post("/users/batch-username-update")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send();

      expect(res).to.have.status(200);
    });

    it("should not update usernames for super_user or member", async function () {
      const res = await chai
        .request(app)
        .post("/users/batch-username-update")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send();

      expect(res).to.have.status(200);
      const affectedUsers = res.body.totalUpdatedUsernames;
      expect(affectedUsers).to.equal(0);
    });

    it("should return 401 for unauthorized user attempting migration", async function () {
      const res = await chai
        .request(app)
        .post("/users/batch-username-update")
        .set("cookie", `${cookieName}=${jwt}`)
        .send();

      expect(res).to.have.status(401);
    });
  });
});
