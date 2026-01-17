import chai from "chai";
import chaiHttp from "chai-http";
const { expect } = chai;
import config from "config";
import sinon from "sinon";
const app = require("../../server");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const authService = require("../../services/authService");
const userData = require("../fixtures/user/user")();
const applicationModel = require("../../models/applications");

const applicationsData = require("../fixtures/applications/applications")();
const cookieName = config.get("userToken.cookieName");
const { APPLICATION_ERROR_MESSAGES, API_RESPONSE_MESSAGES } = require("../../constants/application");

const appOwner = userData[3];
const superUser = userData[4];
const secondUser = userData[0];

chai.use(chaiHttp);

let userId: string;
let superUserId: string;
let secondUserId: string;
let jwt: string;
let superUserJwt: string;
let secondUserJwt: string;
let applicationId1: string;
let applicationId2: string;
let applicationId3: string;
let applicationId4: string;
let applicationId5: string;

describe("Application", function () {
  before(async function () {
    const userIdPromises = [addUser(appOwner), addUser(superUser), addUser(secondUser)];
    const [userId1, userId2, userId3] = await Promise.all(userIdPromises);
    userId = userId1;
    superUserId = userId2;
    secondUserId = userId3;
    jwt = authService.generateAuthToken({ userId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });
    secondUserJwt = authService.generateAuthToken({ userId: secondUserId });
    const applicationOne = { ...applicationsData[0], userId };
    const applicationTwo = { ...applicationsData[1], userId: superUserId };
    const applicationThree = { ...applicationsData[2], userId: "fakfjdkfjkfasjdkfsjdkf" };
    const applicationFour = { ...applicationsData[3], userId: "fkasdjfkldjfldjkfalsdfjl" };
    const applicationFive = { ...applicationsData[4], userId: "kfasdjfkdlfjkasdjflsdjfk" };

    const promises = [
      applicationModel.addApplication(applicationOne),
      applicationModel.addApplication(applicationTwo),
      applicationModel.addApplication(applicationThree),
      applicationModel.addApplication(applicationFour),
      applicationModel.addApplication(applicationFive),
    ];
    const [id1, id2, id3, id4, id5] = await Promise.all(promises);
    applicationId1 = id1;
    applicationId2 = id2;
    applicationId3 = id3;
    applicationId4 = id4;
    applicationId5 = id5;
  });

  after(async function () {
    await cleanDb();
    sinon.restore();
  });

  describe("GET /applications", function () {
    it("should return all the application if the user is super user and there is no user id, and next url if the size provided is equal to the applications returned in query", function (done) {
      chai
        .request(app)
        .get("/applications?size=5")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.next).to.be.equal(
            `/applications?next=${res.body.applications[res.body.applications.length - 1].id}&size=5`
          );

          return done();
        });
    });

    it("should return all the application if the user is super user and there is no user id, and next url should be null if the size provided is not equal to the applications returned in query", function (done) {
      chai
        .request(app)
        .get("/applications?size=25")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.next).to.be.equal(null);

          return done();
        });
    });

    it("should return application of the user if the user is super user and user id is there in query params", function (done) {
      chai
        .request(app)
        .get(`/applications?userId=${userId}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User applications returned successfully!");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].userId).to.be.equal(userId);

          return done();
        });
    });

    it("should return 403 in case the user is not super user and there is no userId in query", function (done) {
      chai
        .request(app)
        .get(`/applications`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body.message).to.be.equal("Unauthorized User");
          expect(res.body.error).to.be.equal("Forbidden");
          return done();
        });
    });

    it("should return the applications of user if the userId of user is same as userId in the application object", function (done) {
      chai
        .request(app)
        .get(`/applications?userId=${userId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("User applications returned successfully!");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].userId).to.be.equal(userId);

          return done();
        });
    });

    it("should return 403 if the userId of user is not same as userId in the application object and user is not super user", function (done) {
      chai
        .request(app)
        .get(`/applications?userId=${superUserId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(403);
          expect(res.body.message).to.be.equal("Unauthorized User");
          expect(res.body.error).to.be.equal("Forbidden");

          return done();
        });
    });

    it("should return application with status rejected if status rejected is passed in query params and next url if the size provided is equal to the applications returned in query ", function (done) {
      chai
        .request(app)
        .get("/applications?status=rejected&size=2")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("rejected");
          expect(res.body.next).to.be.equal(
            `/applications?next=${res.body.applications[res.body.applications.length - 1].id}&size=2&status=rejected`
          );
          expect(res.body).to.not.have.property("totalCount");
          return done();
        });
    });

    it("should return application with status accepted if status accepted is passed in query params", function (done) {
      chai
        .request(app)
        .get("/applications?status=accepted")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("accepted");
          expect(res.body).to.not.have.property("totalCount");
          return done();
        });
    });

    it("should return application with status pending if status pending is passed in query params ", function (done) {
      chai
        .request(app)
        .get("/applications?status=pending")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("pending");
          expect(res.body).to.not.have.property("totalCount");
          return done();
        });
    });

    it("should return application with status rejected and the total count of the rejected applications if  dev = true ", function (done) {
      chai
        .request(app)
        .get("/applications?status=rejected&size=2&dev=true")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("rejected");
          expect(res.body.next).to.be.equal(
            `/applications?next=${res.body.applications[res.body.applications.length - 1].id}&size=2&status=rejected`
          );
          expect(res.body.totalCount).to.be.a("number");
          return done();
        });
    });

    it("should return application with status accepted and the total count of the accepted applications if  dev = true ", function (done) {
      chai
        .request(app)
        .get("/applications?status=accepted&dev=true")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("accepted");
          expect(res.body.totalCount).to.be.a("number");
          return done();
        });
    });

    it("should return application with status pending and the total count of the pending applications if  dev = true ", function (done) {
      chai
        .request(app)
        .get("/applications?status=pending&dev=true")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("pending");
          expect(res.body.totalCount).to.be.a("number");
          return done();
        });
    });

    it("should return application with status rejected if status rejected is passed in query params and next url should be null if the size provided is not equal to the applications returned in query ", function (done) {
      chai
        .request(app)
        .get("/applications?status=rejected&size=5")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("Applications returned successfully");
          expect(res.body.applications).to.be.a("array");
          expect(res.body.applications[0].status).to.be.equal("rejected");
          expect(res.body.next).to.be.equal(null);
          return done();
        });
    });
  });

  describe("POST /applications", function () {
    it("should create a application and return 201 if the user has not yet submitted the application", function (done) {
      chai
        .request(app)
        .post(`/applications`)
        .set("cookie", `${cookieName}=${secondUserJwt}`)
        .send({
          ...applicationsData[5],
          imageUrl: "https://example.com/image.jpg",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("Application created successfully");
          expect(res.body).to.have.property("applicationId");
          return done();
        });
    });
  });

  describe("PATCH /applications/:applicationId/feedback", function () {
    it("should return 200 if the user is super user and application feedback is submitted", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "accepted",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Application feedback submitted successfully");
          return done();
        });
    });

    it("should return 401 if the user is not super user", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}/feedback`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          status: "accepted",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("You are not authorized for this action.");
          return done();
        });
    });

    it("should return 400 if anything other than status and feedback is passed in the body", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "accepted",
          batman: true,
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          expect(res.body.message).to.be.equal('"batman" is not allowed');
          return done();
        });
    });

    it("should return 400 if any status other than accepted, rejected or changes_requested is passed", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "something",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          expect(res.body.message).to.be.equal("Status must be one of: accepted, rejected, or changes_requested");
          return done();
        });
    });
  });

  describe("GET /application/:applicationId", function () {
    it("should return Unauthorized if user is not a super user", function (done) {
      chai
        .request(app)
        .get(`/applications/${applicationId1}`)
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

    it("should return a particular application if it is present in the db and the user is super user ", function (done) {
      chai
        .request(app)
        .get(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Application returned successfully");
          expect(res.body.application.id).to.be.equal(applicationId1);
          return done();
        });
    });

    it("should return 404 if the application doesn't exist", function (done) {
      chai
        .request(app)
        .get(`/applications/faskdfsdjfjk`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body.error).to.be.equal("Not Found");
          expect(res.body.message).to.be.equal("Application not found");
          return done();
        });
    });
  });

  describe("PATCH /applications/:applicationId/nudge", function () {
    let nudgeApplicationId: string;

    beforeEach(async function () {
      const applicationData = { ...applicationsData[0], userId };
      nudgeApplicationId = await applicationModel.addApplication(applicationData);
    });

    afterEach(async function () {
      sinon.restore();
    });

    it("should successfully nudge a pending application when user owns it and no previous nudge exists", function (done) {
      chai
        .request(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
          expect(res.body.nudgeCount).to.be.equal(1);
          expect(res.body.lastNudgeAt).to.be.a("string");
          done();
        });
    });

    it("should successfully nudge an application when 24 hours have passed since last nudge", function (done) {
      chai
        .request(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(200);
          expect(res.body.nudgeCount).to.be.equal(1);

          const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
          applicationModel.updateApplication({ lastNudgeAt: twentyFiveHoursAgo }, nudgeApplicationId).then(() => {
            chai
              .request(app)
              .patch(`/applications/${nudgeApplicationId}/nudge`)
              .set("cookie", `${cookieName}=${jwt}`)
              .end(function (err, res) {
                if (err) return done(err);

                expect(res).to.have.status(200);
                expect(res.body.message).to.be.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
                expect(res.body.nudgeCount).to.be.equal(2);
                expect(res.body.lastNudgeAt).to.be.a("string");
                done();
              });
          });
        });
    });

    it("should return 404 if the application doesn't exist", function (done) {
      chai
        .request(app)
        .patch(`/applications/non-existent-id/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(404);
          expect(res.body.error).to.be.equal("Not Found");
          expect(res.body.message).to.be.equal("Application not found");
          done();
        });
    });

    it("should return 401 if user is not authenticated", function (done) {
      chai
        .request(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("Unauthenticated User");
          done();
        });
    });

    it("should return 401 if user does not own the application", function (done) {
      chai
        .request(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${secondUserJwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("You are not authorized to nudge this application");
          done();
        });
    });

    it("should return 429 when trying to nudge within 24 hours", function (done) {
      chai
        .request(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(200);

          chai
            .request(app)
            .patch(`/applications/${nudgeApplicationId}/nudge`)
            .set("cookie", `${cookieName}=${jwt}`)
            .end(function (err, res) {
              if (err) return done(err);

              expect(res).to.have.status(429);
              expect(res.body.error).to.be.equal("Too Many Requests");
              expect(res.body.message).to.be.equal(APPLICATION_ERROR_MESSAGES.NUDGE_TOO_SOON);
              done();
            });
        });
    });

    it("should return 400 when trying to nudge an application that is not in pending status", function (done) {
      const nonPendingApplicationData = { ...applicationsData[1], userId };
      applicationModel.addApplication(nonPendingApplicationData).then((nonPendingApplicationId: string) => {
        chai
          .request(app)
          .patch(`/applications/${nonPendingApplicationId}/nudge`)
          .set("cookie", `${cookieName}=${jwt}`)
          .end(function (err, res) {
            if (err) return done(err);

            expect(res).to.have.status(400);
            expect(res.body.error).to.be.equal("Bad Request");
            expect(res.body.message).to.be.equal(APPLICATION_ERROR_MESSAGES.NUDGE_ONLY_PENDING_ALLOWED);
            done();
          });
      });
    });
  });
});
