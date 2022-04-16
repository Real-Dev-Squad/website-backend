/* eslint-disable security/detect-object-injection */
const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");

const flagModel = require("../../../models/flag");
const firestore = require("../../../utils/firestore");
const flagFirestore = firestore.collection("featureFlags");
const flagData = require("../../fixtures/flag/flag")();

describe("flags", function () {
  let flagId;

  beforeEach(async function () {
    flagId = await flagModel.addFlag(flagData);
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("add feature flag", function () {
    it("Should return flag Id", async function () {
      const mock = await flagFirestore.doc(flagId).get();
      const mockData = mock.data();
      const mockId = mock.id;
      Object.keys(flagData).forEach((key) => {
        expect(flagData[key]).to.deep.equal(mockData[key]);
      });
      expect(mockId).to.equal(flagId);
    });
  });
});
