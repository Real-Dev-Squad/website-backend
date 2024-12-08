const chai = require("chai");
const { expect } = chai;
const cleanDb = require("../../utils/cleanDb");
const profileDiffsQuery = require("../../../models/profileDiffs");
const getProfileDiffs = require("../../fixtures/profileDiffs/profileDiffs");

describe("profileDiffs", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("fetchProfileDiffUnobfuscated", function () {
    it("should successfully return profileDiffs", async function () {
      const profileDiffs = getProfileDiffs();
      const profileDiffId = await profileDiffsQuery.add(profileDiffs[1]);
      const diff = await profileDiffsQuery.fetchProfileDiffUnobfuscated(profileDiffId);
      expect(diff).haveOwnProperty("id");
      expect(diff.profileDiffExists).to.equal(true);
    });

    it("should not return profileDiffs for invalid id", async function () {
      const profileDiffs = getProfileDiffs();
      await profileDiffsQuery.add(profileDiffs[0]);
      const profileDiffId = "invalid-id";
      const diff = await profileDiffsQuery.fetchProfileDiffUnobfuscated(profileDiffId);
      expect(diff.profileDiffExists).to.equal(false);
    });

    it("should return profileDiffs with unobfuscated email and phone", async function () {
      const profileDiffs = getProfileDiffs();
      const profileDiffId = await profileDiffsQuery.add(profileDiffs[0]);
      const diff = await profileDiffsQuery.fetchProfileDiffUnobfuscated(profileDiffId);
      expect(diff.phone).to.equal(profileDiffs[0].phone);
      expect(diff.email).to.equal(profileDiffs[0].email);
    });
  });
});
