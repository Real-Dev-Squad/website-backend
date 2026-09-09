import { expect } from "chai";
import { request } from "chai-http";
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
const { APPLICATION_ERROR_MESSAGES, API_RESPONSE_MESSAGES, APPLICATION_SCORE } = require("../../constants/application");
const imageService = require("../../services/imageService");
const { Buffer } = require("node:buffer");

const appOwner = userData[3];
const superUser = userData[4];
const secondUser = userData[0];


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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
    it("should create a application and return 201 if the user has not yet submitted the application", async function () {
      const res = await request.execute(app)
        .post(`/applications`)
        .set("cookie", `${cookieName}=${secondUserJwt}`)
        .send({
          ...applicationsData[5],
          imageUrl: "https://example.com/image.jpg",
        });

      expect(res).to.have.status(201);
      expect(res.body.message).to.be.equal("Application created successfully");
      expect(res.body).to.have.property("applicationId");

      const getRes = await request.execute(app)
        .get(`/applications/${res.body.applicationId}`)
        .set("cookie", `${cookieName}=${superUserJwt}`);

      expect(getRes).to.have.status(200);
      expect(getRes.body.application.score).to.be.equal(50);
    });
  });

  describe("PATCH /applications/:applicationId", function () {
    it("should return 200 and update application when owner sends valid payload", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ introduction: "Updated introduction text" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Application updated successfully");
          return done();
        });
    });

    it("should return 400 when request body is empty", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({})
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          expect(res.body.message).to.include("at least one allowed field");
          return done();
        });
    });

    it("should return 400 when request body contains disallowed field", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ batman: true })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          return done();
        });
    });

    it("should return 400 when imageUrl is not a valid URI", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ imageUrl: "not-a-valid-uri" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          return done();
        });
    });

    it("should return 404 when application does not exist", function (done) {
      request.execute(app)
        .patch(`/applications/non-existent-application-id`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ introduction: "Updated" })
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

    it("should return 401 when user is not authenticated", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}`)
        .send({ introduction: "Updated" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });

    it("should return 401 when user does not own the application", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${secondUserJwt}`)
        .send({ introduction: "Updated" })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("You are not authorized to edit this application");
          return done();
        });
    });

    it("should return 409 when edit is attempted within 24 hours of last edit", async function () {
      const applicationForEditTest = { ...applicationsData[0], userId };
      const editTestApplicationId = await applicationModel.addApplication(applicationForEditTest);

      const firstRes = await request.execute(app)
        .patch(`/applications/${editTestApplicationId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ introduction: "First edit" });

      expect(firstRes).to.have.status(200);

      const secondRes = await request.execute(app)
        .patch(`/applications/${editTestApplicationId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ foundFrom: "Second edit" });

      expect(secondRes).to.have.status(409);
      expect(secondRes.body.error).to.be.equal("Conflict");
      expect(secondRes.body.message).to.be.equal(APPLICATION_ERROR_MESSAGES.EDIT_TOO_SOON);
    });

    it("should return 200 when updating city, state, and country", async function () {
      const applicationData = { ...applicationsData[0], userId };
      const testApplicationId = await applicationModel.addApplication(applicationData);

      const res = await request.execute(app)
        .patch(`/applications/${testApplicationId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ city: "New Delhi", state: "Delhi", country: "India" });

      expect(res).to.have.status(200);
      expect(res.body.message).to.be.equal("Application updated successfully");
    });

    it("should return 200 when updating role with a valid role", async function () {
      const applicationData = { ...applicationsData[0], userId };
      const testApplicationId = await applicationModel.addApplication(applicationData);

      const res = await request.execute(app)
        .patch(`/applications/${testApplicationId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ role: "designer" });

      expect(res).to.have.status(200);
      expect(res.body.message).to.be.equal("Application updated successfully");
    });

    it("should return 400 when updating role with an invalid role", async function () {
      const applicationData = { ...applicationsData[0], userId };
      const testApplicationId = await applicationModel.addApplication(applicationData);

      const res = await request.execute(app)
        .patch(`/applications/${testApplicationId}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({ role: "invalid_role" });

      expect(res).to.have.status(400);
      expect(res.body.error).to.be.equal("Bad Request");
    });
  });

  describe("PATCH /applications/:applicationId/feedback", function () {
    it("should return 200 if the user is super user and application feedback is submitted", function (done) {
      request.execute(app)
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

    it("should return 400 if anything other than status and feedback is passed in the body", function (done) {
      request.execute(app)
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
      request.execute(app)
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

    it("should return 200 when submitting feedback with status rejected", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId2}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "rejected",
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

    it("should return 200 when submitting feedback with status changes_requested and feedback text", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId3}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "changes_requested",
          feedback: "Please update your skills section with more details",
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

    it("should return 400 when status is changes_requested without feedback", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "changes_requested",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body.error).to.be.equal("Bad Request");
          expect(res.body.message).to.include("Feedback is required when status is changes_requested");
          return done();
        });
    });

    it("should return 200 when submitting feedback with status accepted and optional feedback text", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId4}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "accepted",
          feedback: "Great application!",
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

    it("should return 200 when submitting feedback with status rejected and optional feedback text", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId5}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "rejected",
          feedback: "Not a good fit for this role",
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

    it("should return 200 when submitting feedback with status accepted and empty feedback string", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId2}/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "accepted",
          feedback: "",
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

    it("should return 404 when application does not exist", function (done) {
      request.execute(app)
        .patch(`/applications/non-existent-application-id/feedback`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "accepted",
        })
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

    it("should return 401 when user is not authenticated", function (done) {
      request.execute(app)
        .patch(`/applications/${applicationId1}/feedback`)
        .send({
          status: "accepted",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("Unauthenticated User");
          return done();
        });
    });

    it("should return 401 if user is not a super user", function (done) {
      request.execute(app)
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
          expect(res.body.error).to.be.equal("Unauthorized");
          expect(res.body.message).to.be.equal("You are not authorized for this action.");
          return done();
        });
    });
  });

  describe("GET /application/:applicationId", function () {
    it("should return Unauthorized if user is not a super user", function (done) {
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      const applicationData = { ...applicationsData[0], userId, score: APPLICATION_SCORE.INITIAL_SCORE };
      nudgeApplicationId = await applicationModel.addApplication(applicationData);
    });

    afterEach(async function () {
      sinon.restore();
    });

    it("should successfully nudge a pending application when user owns it and no previous nudge exists", function (done) {
      request.execute(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
          expect(res.body.nudgeCount).to.be.equal(1);
          expect(res.body.lastNudgeAt).to.be.a("string");
          expect(res.body.score).to.be.equal(APPLICATION_SCORE.INITIAL_SCORE + APPLICATION_SCORE.NUDGE_BONUS);
          done();
        });
    });

    it("should successfully nudge an application when 24 hours have passed since last nudge", function (done) {
      request.execute(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(200);
          expect(res.body.nudgeCount).to.be.equal(1);
          expect(res.body.score).to.be.equal(APPLICATION_SCORE.INITIAL_SCORE + APPLICATION_SCORE.NUDGE_BONUS);

          const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
          applicationModel
            .updateApplication(
              { lastNudgeAt: twentyFiveHoursAgo },
              nudgeApplicationId,
              userId,
              appOwner.username,
              {}
            )
            .then(() => {
              request.execute(app)
                .patch(`/applications/${nudgeApplicationId}/nudge`)
                .set("cookie", `${cookieName}=${jwt}`)
                .end(function (err, res) {
                  if (err) return done(err);

                  expect(res).to.have.status(200);
                  expect(res.body.message).to.be.equal(API_RESPONSE_MESSAGES.NUDGE_SUCCESS);
                  expect(res.body.nudgeCount).to.be.equal(2);
                  expect(res.body.lastNudgeAt).to.be.a("string");
                  expect(res.body.score).to.be.equal(APPLICATION_SCORE.INITIAL_SCORE + 2 * APPLICATION_SCORE.NUDGE_BONUS);
                  done();
                });
            })
        });
    });

    it("should return 404 if the application doesn't exist", function (done) {
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
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
      request.execute(app)
        .patch(`/applications/${nudgeApplicationId}/nudge`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (err, res) {
          if (err) return done(err);

          expect(res).to.have.status(200);

          request.execute(app)
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
        request.execute(app)
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

  describe("POST /users/picture (application type)", function () {
    it("should return 201 when uploading with type=application and valid file", function (done) {
      const mockImageResponse = { publicId: "profile/test-id/image", url: "https://res.cloudinary.com/example/image.png" };
      const uploadStub = sinon.stub(imageService, "uploadProfilePicture").resolves(mockImageResponse);
      request.execute(app)
        .post("/users/picture")
        .type("form")
        .set("cookie", `${cookieName}=${jwt}`)
        .attach("profile", Buffer.from("fake-image-data", "utf-8"), "image.png")
        .field("type", "application")
        .end((err, res) => {
          uploadStub.restore();
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body.message).to.equal("Application picture uploaded successfully!");
          expect(res.body.image).to.deep.equal(mockImageResponse);
          return done();
        });
    });

    it("should return 500 when upload fails", function (done) {
      const uploadStub = sinon.stub(imageService, "uploadProfilePicture").rejects(new Error("Upload failed"));
      request.execute(app)
        .post("/users/picture")
        .type("form")
        .set("cookie", `${cookieName}=${jwt}`)
        .attach("profile", Buffer.from("fake-image-data", "utf-8"), "image.png")
        .field("type", "application")
        .end((err, res) => {
          uploadStub.restore();
          if (err) return done(err);
          expect(res).to.have.status(500);
          expect(res.body.error).to.equal("Internal Server Error");
          return done();
        });
    });
  });
});
