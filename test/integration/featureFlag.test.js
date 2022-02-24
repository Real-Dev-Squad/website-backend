const chai = require("chai");
const { expect } = require("chai");
const chaiHttp = require("chai-http");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");
const featureFlagQuery = require("../../models/featureFlags");

// Import fixtures
const userData = require("../fixtures/user/user")();
const featureFlagData = require("../fixtures/featureFlag/featureFlag")();

const config = require("config");
const cookieName = config.get("userToken.cookieName");

const appOwner = userData[5];
chai.use(chaiHttp);

describe("FeatureFlag", function () {
  let jwt;
  let featureFlag;
  beforeEach(async function () {
    const userId = await addUser(appOwner);
    jwt = authService.generateAuthToken({ userId });
    featureFlag = await featureFlagQuery.addFeatureFlags(featureFlagData[0], appOwner.username);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("GET /featureFlags", function () {
    it("Should return all feature flags", function (done) {
      chai
        .request(app)
        .get("/featureFlags")
        .end((res, err) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          expect(res.body.message).to.equal("FeatureFlags returned successfully!");
          expect(res.body.featureFlags).to.be.a("array");

          return done();
        });
    });
  });

  describe("POST /featureFlags", function () {
    it("Should add the feature flag in db", function (done) {
      chai
        .request(app)
        .post("/featureFlags")
        .set("cookie", `${cookieName} = ${jwt}`)
        .send(
          {
            name: "test",
            title: "test-feature",
          },
          appOwner.username
        )
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("object");
          const { data } = res.body;
          expect(data).to.be.a("object");
          expect(data.name).to.be.a("string");
          expect(data.title).to.be.a("string");
          expect(data.created_at).to.be.a("number");
          expect(data.updated_at).to.be.a("number");
          expect(data.config).to.be.a("object");
          expect(data.config.enabled).to.be.a("boolean");
          expect(data.owner).to.be.a("string");
          expect(res.body.message).to.equal("FeatureFlag added successfully!");

          return done();
        });
    });

    it("Should return 401 if user not logged in", function (done) {
      chai
        .request(app)
        .post("/featureFlags")
        .end((res, err) => {
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

  describe("PATCH /featureFlags/:id", function () {
    it("Should update the feature flag", function (done) {
      chai
        .request(app)
        .patch(`/featureFlags/${featureFlag.id}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .send({
          config: {
            enabled: false,
          },
        })
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(204);

          return done();
        });
    });

    // TODO: Add test cases to update all the possible updates to the featureFlag config

    it("Should return 401 if user not logged in", function (done) {
      chai
        .request(app)
        .patch(`/featureFlags/${featureFlag.id}`)
        .end((res, err) => {
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

    it("Should return 404 if feature flag does not exist", function (done) {
      chai
        .request(app)
        .patch("/featureFlags/featureFlagId")
        .end((res, err) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 404,
            error: "Not Found",
            message: "No featureFlag found",
          });

          return done();
        });
    });
  });

  describe("DELETE /featureFlags/:id", function () {
    it("Should delete the feature flag", function (done) {
      chai
        .request(app)
        .delete(`/featureFlags/${featureFlag.id}`)
        .set("cookie", `${cookieName}=${jwt}`)
        .end((err, res) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(200);

          return done();
        });
    });

    it("Should return 401 if user not logged in", function (done) {
      chai
        .request(app)
        .delete(`/featureFlags/${featureFlag.id}`)
        .end((res, err) => {
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

    it("Should return 404 if feature flag does not exist", function (done) {
      chai
        .request(app)
        .delete("/featureFlags/featureFlagId")
        .end((res, err) => {
          if (err) {
            return done();
          }

          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 404,
            error: "Not Found",
            message: "No feature flag found",
          });

          return done();
        });
    });
  });
});
