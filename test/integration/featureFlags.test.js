import featureFlagService from "../../services/featureFlagService";
const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");
const sinon = require("sinon");

const app = require("../../server");
const authService = require("../../services/authService");
const addUser = require("../utils/addUser");
const cleanDb = require("../utils/cleanDb");

const userData = require("../fixtures/user/user")();
const { featureFlagData, invalidFeatureFlag } = require("../fixtures/featureFlag/featureFlags");
const superUser = userData[4];

const config = require("config");
const cookieName = config.get("userToken.cookieName");

chai.use(chaiHttp);

describe("Feature Flag API", function () {
  let superUserId;
  let superUserAuthToken;
  let createFeatureFlagStub;
  let getFeatureFlagByIdStub;
  let getAllFeatureFlagsStub;
  const mockFlags = featureFlagData;

  beforeEach(async function () {
    superUserId = await addUser(superUser);
    superUserAuthToken = authService.generateAuthToken({ userId: superUserId });
    createFeatureFlagStub = sinon.stub(featureFlagService, "createFeatureFlag");
    getFeatureFlagByIdStub = sinon.stub(featureFlagService, "getFeatureFlagById");
    getAllFeatureFlagsStub = sinon.stub(featureFlagService, "getAllFeatureFlags");
  });

  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("POST /feature-flag/createFeatureFlag", function () {
    it("should create new feature flag successfully", function (done) {
      const validFlag = {
        Name: "test-flag",
        Description: "Test flag description",
        UserId: superUserId,
      };

      const serviceResponse = {
        status: 201,
        data: {
          message: "Feature flag created successfully",
        },
      };

      createFeatureFlagStub.resolves(serviceResponse);

      chai
        .request(app)
        .post("/feature-flag/createFeatureFlag")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(validFlag)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(201);
          expect(res.body).to.deep.equal({
            message: "Feature flag created successfully",
            data: {
              message: "Feature flag created successfully",
            },
          });
          return done();
        });
    });

    it("should handle validation error", function (done) {
      const invalidFlag = { ...invalidFeatureFlag, UserId: superUserId };
      const serviceResponse = {
        status: 400,
        error: {
          message: "Name is required",
        },
      };

      createFeatureFlagStub.resolves(serviceResponse);

      chai
        .request(app)
        .post("/feature-flag/createFeatureFlag")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .send(invalidFlag)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(400);
          expect(res.body).to.deep.equal({
            statusCode: 400,
            error: "Bad Request",
            message: "Name is required",
          });
          return done();
        });
    });
  });

  describe("GET /feature-flag/getFeatureFlag/:flagId", function () {
    it("should return specific feature flag successfully", function (done) {
      const mockFlag = mockFlags[0];

      const serviceResponse = {
        status: 200,
        data: mockFlag,
      };

      getFeatureFlagByIdStub.resolves(serviceResponse);

      chai
        .request(app)
        .get("/feature-flag/getFeatureFlag/123")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            message: "Feature flag retrieved successfully",
            data: mockFlag,
          });
          return done();
        });
    });

    it("should return error for non-existent flag", function (done) {
      const serviceResponse = {
        status: 404,
        error: { message: "Feature flag not found" },
      };

      getFeatureFlagByIdStub.resolves(serviceResponse);

      chai
        .request(app)
        .get("/feature-flag/getFeatureFlag/nonexistent")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(404);
          expect(res.body).to.deep.equal({
            error: "Feature flag not found",
          });
          return done();
        });
    });
  });

  describe("GET /feature-flag/getAllFeatureFlags", function () {
    it("should return all feature flags successfully", function (done) {
      const mockFlags = featureFlagData;

      const serviceResponse = mockFlags;
      getAllFeatureFlagsStub.resolves(serviceResponse);

      chai
        .request(app)
        .get("/feature-flag/getAllFeatureFlags")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({
            message: "Feature flags retrieved successfully",
            data: mockFlags,
          });
          return done();
        });
    });

    it("should handle service error", function (done) {
      const serviceResponse = {
        status: 500,
        error: {
          message: "Internal error while connecting to the feature flag service",
        },
      };

      getAllFeatureFlagsStub.resolves(serviceResponse);

      chai
        .request(app)
        .get("/feature-flag/getAllFeatureFlags")
        .set("cookie", `${cookieName}=${superUserAuthToken}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res).to.have.status(500);
          expect(res.body).to.deep.equal({
            error: "Internal error while connecting to the feature flag service",
          });
          return done();
        });
    });
  });
});
