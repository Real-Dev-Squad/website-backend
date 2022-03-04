const profileDiffs = require("../../models/profileDiffs");

// Import fixtures
const profileDiffsData = require("../fixtures/profileDiffs/profileDiffs")();

/**
 * File to be required in every test file where profileDiffs are required
 */
module.exports = async (profile) => {
  const isValid = profile && Object.keys(profile).length !== 0 && profile.constructor === Object;
  profile = isValid ? profile : profileDiffsData[0];
  return await profileDiffs.add(profile);
};
