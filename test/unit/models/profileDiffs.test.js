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

    it("it should throw an error on undefined profileDiff Id", async function () {
      const profileDiffs = getProfileDiffs();
      await profileDiffsQuery.add(profileDiffs[0]);
      let error = "";
      try {
        await profileDiffsQuery.fetchProfileDiffUnobfuscated(undefined);
      } catch (err) {
        error = err;
      }
      Object.freeze(error);
      expect(error).to.be.an("Error");
      expect(error.message).to.be.equal(
        'Value for argument "documentPath" is not a valid resource path. Path must be a non-empty string.'
      );
    });

    it("it should throw an error on null profileDiff Id", async function () {
      const profileDiffs = getProfileDiffs();
      await profileDiffsQuery.add(profileDiffs[0]);
      let error = "";
      try {
        await profileDiffsQuery.fetchProfileDiffUnobfuscated(null);
      } catch (err) {
        error = err;
      }
      Object.freeze(error);
      expect(error).to.be.an("Error");
      expect(error.message).to.be.equal(
        'Value for argument "documentPath" is not a valid resource path. Path must be a non-empty string.'
      );
    });

    it("it should throw an error on passing profileDiff Id as empty string", async function () {
      const profileDiffs = getProfileDiffs();
      await profileDiffsQuery.add(profileDiffs[0]);
      let error = "";
      try {
        await profileDiffsQuery.fetchProfileDiffUnobfuscated("");
      } catch (err) {
        error = err;
      }
      Object.freeze(error);
      expect(error).to.be.an("Error");
      expect(error.message).to.be.equal(
        'Value for argument "documentPath" is not a valid resource path. Path must be a non-empty string.'
      );
    });

    it("it should correctly fetch deeply nested profileDiff", async function () {
      const profileDiff = {
        level1: {
          level2: {
            level3: {
              level4: {
                level5: {
                  level6: {
                    level7: {
                      level8: {
                        level9: {
                          level10: "nested-random-diff",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      const profileDiffId = await profileDiffsQuery.add(profileDiff);
      const diff = await profileDiffsQuery.fetchProfileDiffUnobfuscated(profileDiffId);
      expect(diff)
        .to.have.nested.property("level1.level2.level3.level4.level5.level6.level7.level8.level9.level10")
        .that.equals("nested-random-diff");
    });
  });
});
