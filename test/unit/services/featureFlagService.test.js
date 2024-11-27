import sinon from "sinon";
import { expect } from "chai";
import featureFlagService from "../../../services/featureFlagService";
import { featureFlagData, newFeatureFlag } from "../../fixtures/featureFlag/featureFlags";

describe("Feature Flag services", function () {
  let fetchStub;

  beforeEach(function () {
    fetchStub = sinon.stub(global, "fetch");
  });

  afterEach(function () {
    sinon.restore();
  });

  describe("getAllFeatureFlags", function () {
    it("successfully fetches all feature flags", async function () {
      fetchStub.resolves({
        ok: true,
        status: 200,
        json: () => Promise.resolve(featureFlagData),
      });

      const result = await featureFlagService.getAllFeatureFlags();
      expect(result).to.deep.equal(featureFlagData);
    });

    it("handles fetch error", async function () {
      fetchStub.rejects(new Error("Network error"));

      const result = await featureFlagService.getAllFeatureFlags();
      expect(result).to.deep.equal({
        status: 500,
        error: { message: "Internal error while connecting to the feature flag service" },
      });
    });
  });

  describe("createFeatureFlag", function () {
    it("successfully creates a new feature flag", async function () {
      fetchStub.resolves({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            message: "Feature flag created successfully",
          }),
      });

      const result = await featureFlagService.createFeatureFlag(newFeatureFlag);
      expect(result).to.deep.equal({
        status: 201,
        data: {
          message: "Feature flag created successfully",
        },
      });
    });

    it("handles creation error", async function () {
      fetchStub.resolves({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            message: "An error occurred while creating the feature flag",
          }),
      });

      const result = await featureFlagService.createFeatureFlag({});
      expect(result).to.deep.equal({
        status: 400,
        error: { message: "An error occurred while creating the feature flag" },
      });
    });
  });

  describe("getFeatureFlagById", function () {
    it("successfully fetches a feature flag by id", async function () {
      const mockFlag = featureFlagData[0];

      fetchStub.resolves({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify(mockFlag)),
      });

      const result = await featureFlagService.getFeatureFlagById(mockFlag.id);
      expect(result).to.deep.equal({
        status: 200,
        data: mockFlag,
      });
    });

    it("handles fetch error", async function () {
      fetchStub.resolves({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Feature flag not found"),
      });

      const result = await featureFlagService.getFeatureFlagById("invalid-id");
      expect(result).to.deep.equal({
        status: 404,
        error: { message: "Feature flag not found" },
      });
    });
  });
});
