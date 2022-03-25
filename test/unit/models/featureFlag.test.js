/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */
const chai = require("chai");
const { expect } = chai;

const addUser = require("../../utils/addUser");
const cleanDb = require("../../utils/cleanDb");
const firestore = require("../../../utils/firestore");

const featureFlagQuery = require("../../../models/featureFlags");
const featureFlagModel = firestore.collection("featureFlags");

const featureFlagData = require("../../fixtures/featureFlag/featureFlag")();
const userData = require("../../fixtures/user/user")();
const appOwner = userData[5];
const featureFlagMockData = featureFlagData[0];

describe("FeatureFlag", function () {
  let featureFlag;
  beforeEach(async function () {
    featureFlag = await featureFlagQuery.addFeatureFlags(featureFlagMockData, appOwner.username);
    await addUser();
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("addFeatureFlag", function () {
    it("Should add the feature flag data", async function () {
      const data = (await featureFlagModel.doc(featureFlag.id).get()).data();

      Object.keys(featureFlagMockData).forEach((key) => {
        expect(featureFlagMockData[key]).to.deep.equal(data[key]);
        expect(featureFlag[key]).to.deep.equal(data[key]);
      });

      expect(featureFlag.id).to.be.a("string");
      expect(featureFlag.created_at).to.be.a("number");
      expect(featureFlag.updated_at).to.be.a("number");
    });
  });

  describe("updateFeatureFlag", function () {
    const updatedData = {
      config: {
        enabled: false,
      },
    };
    it("Should update the feature flag", async function () {
      const { isUpdated } = await featureFlagQuery.updateFeatureFlags(updatedData, featureFlag.id);

      expect(isUpdated).to.equal(true);
    });
    it("Should return isDeleted to be false", async function () {
      const { isUpdated } = await featureFlagQuery.updateFeatureFlags(updatedData, "invalid_id");

      expect(isUpdated).to.equal(false);
    });
  });

  describe("deleteFeatureFlag", function () {
    it("Should delete the feature flag", async function () {
      const { isDeleted } = await featureFlagQuery.deleteFeatureFlag(featureFlag.id);
      const databaseData = (await featureFlagModel.doc(featureFlag.id).get()).data();

      expect(isDeleted).to.equal(true);
      expect(databaseData).to.be.equal(undefined);
    });

    it("Should return isDeleted to be false", async function () {
      const { isDeleted } = await featureFlagQuery.deleteFeatureFlag("invalid_id");

      expect(isDeleted).to.equal(false);
    });
  });

  describe("fetchFeatureFlag", function () {
    it("Should fetch all feature flag", async function () {
      await featureFlagQuery.addFeatureFlags(featureFlagMockData, "Pallab");

      const response = await featureFlagQuery.fetchFeatureFlag();

      expect(response).to.be.a("array").with.lengthOf(2);
    });
  });
});
