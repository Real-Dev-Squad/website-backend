const app = require("../../server");
const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const fs = require("node:fs");

const fixture = require("../fixtures/badges/badges");
const userData = require("../fixtures/user/user")();

const model = require("../../models/badges");

const authService = require("../../services/authService");
const imageService = require("../../services/imageService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require("../../constants/badges");
const { CONTROLLERS: CONTROLLERS_SUCCESS_MESSAGES } = SUCCESS_MESSAGES;
const { VALIDATORS: ERROR_MESSAGES_VALIDATORS, MISC } = ERROR_MESSAGES;
const { expect } = chai;

let jwt;
let userId;

const superUser = userData[4];
const cookieName = config.get("userToken.cookieName");
const file = fs.readFileSync(fixture.LOCAL_IMAGE_FILE_PATH);

chai.use(chaiHttp);

describe("Badges", function () {
  beforeEach(async function () {
    userId = await addUser(superUser);
    jwt = authService.generateAuthToken({ userId });
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /badges", function () {
    it("Should get all the list of badges", function (done) {
      sinon.stub(model, "fetchBadges").returns(fixture.BADGES);
      chai
        .request(app)
        .get("/badges")
        .end(function (error, response) {
          if (error) {
            return done();
          }

          expect(response).to.have.status(200);
          expect(response.body).to.be.a("object");
          expect(response.body.message).to.equal(CONTROLLERS_SUCCESS_MESSAGES.GET_BADGES);
          expect(response.body.badges).to.be.a("array");
          expect(response.body.badges).to.have.length(3);
          expect(response.body.badges[0]).to.deep.equal(fixture.BADGES[0]);

          return done();
        });
    });
  });

  describe("POST /badges", function () {
    it("Should return user is unauthorized", function (done) {
      chai
        .request(app)
        .post("/badges")
        .end(function (error, response) {
          if (error) {
            return done();
          }
          expect(response).to.have.status(401);
          expect(response.body.message).to.contains(MISC.UNAUTHENTICATED_USER);
          expect(response.body.error).to.equal("Unauthorized");
          return done();
        });
    });

    it("Should return file is missing", function (done) {
      chai
        .request(app)
        .post("/badges")
        .set("cookie", `${cookieName}=${jwt}`)
        .end(function (error, response) {
          if (error) {
            return done();
          }

          expect(response).to.have.status(400);
          expect(response.body.message).to.contains(ERROR_MESSAGES_VALIDATORS.CREATE_BADGE.FILE_IS_MISSING);
          expect(response.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return API payload failed validation, createdBy is required", function (done) {
      chai
        .request(app)
        .post("/badges")
        .type("form")
        .set("cookie", `${cookieName}=${jwt}`)
        .attach("file", file, "simple.png")
        .field({
          name: "badgexRandom",
        })
        .end(function (error, response) {
          if (error) {
            return done();
          }

          expect(response).to.have.status(400);
          expect(response.body.message).to.equal(
            `${ERROR_MESSAGES_VALIDATORS.API_PAYLOAD_VALIDATION_FAILED}, "createdBy" is required`
          );
          expect(response.body.error).to.equal("Bad Request");

          return done();
        });
    });

    it("Should return success message, Badge created succesfully and badge-object", function (done) {
      sinon.stub(imageService, "uploadBadgeImage").returns(fixture.CLOUNDINARY_BADGE_IMAGE_UPLOAD_RESPONSE);
      sinon.stub(model, "createBadge").returns(fixture.EXPECTED_BADGE_OBJECT);
      chai
        .request(app)
        .post("/badges")
        .type("form")
        .set("cookie", `${cookieName}=${jwt}`)
        .attach("file", file, "simple.png")
        .field({
          name: "badgeXrandom",
          createdBy: "shmbajaj",
        })
        .end(function (error, response) {
          if (error) {
            return done();
          }
          expect(response).to.have.status(200);
          expect(response.body.message).to.equal(SUCCESS_MESSAGES.CONTROLLERS.POST_BADGE);
          expect(response.body.badge).to.deep.equal(fixture.EXPECTED_BADGE_OBJECT);

          return done();
        });
    });
  });
});
