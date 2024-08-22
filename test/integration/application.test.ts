import chai from "chai";
import chaiHttp from "chai-http";
const { expect } = chai;
import config from "config";
const app = require("../../server");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const authService = require("../../services/authService");
const userData = require("../fixtures/user/user")();
const applicationModel = require("../../models/applications");
const { requestRoleData } = require("../fixtures/discordactions/discordactions");

const applicationsData = require("../fixtures/applications/applications")();
const cookieName = config.get("userToken.cookieName");

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
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(201);
          expect(res.body.message).to.be.equal("User application added.");
          return done();
        });
    });

    it("should return 409 if the user data is already submitted and the status is pending", function (done) {
      chai
        .request(app)
        .post(`/applications`)
        .set("cookie", `${cookieName}=${secondUserJwt}`)
        .send({
          ...applicationsData[5],
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(409);
          expect(res.body.message).to.be.equal("User application is already present!");
          return done();
        });
    });
  });

  describe("PATCH /application/:applicationId", function () {
    it("should return 200 if the user is super user and application is updated", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .send({
          status: "accepted",
        })
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal("Application updated successfully!");
          expect(res.body.data).to.deep.equal({
            status: "accepted",
          });
          return done();
        });
    });
    it("should return 401 if the user is not super user", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}`)
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
        .patch(`/applications/${applicationId1}`)
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

    it("should return 400 if any status other than accepted, reject or pending is passed", function (done) {
      chai
        .request(app)
        .patch(`/applications/${applicationId1}`)
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
          expect(res.body.message).to.be.equal("Status is not valid");
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

  describe("PATCH /application/batch/update", function () {
    it("should return 401 if the user is not super user", function (done) {
      chai
        .request(app)
        .patch(`/applications/batch/update`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(401);
          expect(res.body.message).to.be.equal("You are not authorized for this action.");
          return done();
        });
    });

    it("should return updated stats after updating all the application", function (done) {
      chai
        .request(app)
        .patch(`/applications/batch/update`)
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body).to.be.deep.equal({
            failedApplicationUpdateIds: [],
            totalFailedApplicationUpdates: 0,
            totalApplicationUpdates: 6,
          });
          return done();
        });
    });
  });
});
