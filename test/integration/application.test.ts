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

chai.use(chaiHttp);

let userId: string;
let superUserId: string;
let jwt: string;
let superUserJwt: string;

describe("Application", function () {
  before(async function () {
    userId = await addUser(appOwner);
    superUserId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId });
    superUserJwt = authService.generateAuthToken({ userId: superUserId });
    console.log(applicationsData, "applicationData...");
    const applicationOne = { ...applicationsData[0], userId };
    const applicationTwo = { ...applicationsData[1], superUserId };

    const promises = [applicationModel.addApplication(applicationOne), applicationModel.addApplication(applicationTwo)];

    await Promise.all(promises);
  });

  after(async function () {
    await cleanDb();
  });
  describe("GET /applications", function () {
    it("should return all the application if the user is super user and there is no user id", function (done) {
      chai
        .request(app)
        .get("/applications")
        .set("cookie", `${cookieName}=${superUserJwt}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("application returned successfully!");
          expect(res.body.applications).to.be.a("array");

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
          expect(res.body.message).to.equal("application returned successfully!");
          expect(res.body.application).to.be.a("object");
          expect(res.body.application.userId).to.be.equal(userId);

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

    it("should return the user object if the userId of user is same as userId in the application object", function (done) {
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
          expect(res.body.message).to.equal("application returned successfully!");
          expect(res.body.application).to.be.a("object");
          expect(res.body.application.userId).to.be.equal(userId);

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

  });
});
