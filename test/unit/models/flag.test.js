/* eslint-disable security/detect-object-injection */
const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");

const flagModel = require("../../../models/flag");
const firestore = require("../../../utils/firestore");
const flagSnapshot = firestore.collection("featureFlags");
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
      const fetched = await flagSnapshot.doc(flagId).get();
      const fetchedData = fetched.data();
      const fetchedId = fetched.id;
      Object.keys(flagData).forEach((key) => {
        expect(flagData[key]).to.deep.equal(fetchedData[key]);
      });
      expect(fetchedId).to.equal(flagId);
    });
  });
});
