/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const users = require("../../../models/users");
const firestore = require("../../../utils/firestore");
const { userPhotoVerificationData, newUserPhotoVerificationData } = require("../../fixtures/user/photo-verification");
const userModel = firestore.collection("users");
const userDataArray = require("../../fixtures/user/user")();
const photoVerificationModel = firestore.collection("photo-verification");

/**
 * Test the model functions and validate the data stored
 */

describe("users", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("addOrUpdate", function () {
    it("should add the user collection and set the flag incompleteUserDetails and isNewUser", async function () {
      const userData = userDataArray[0];
      const { isNewUser, userId } = await users.addOrUpdate(userData);

      const data = (await userModel.doc(userId).get()).data();

      Object.keys(userData).forEach((key) => {
        expect(userData[key]).to.deep.equal(data[key]);
      });

      expect(data.incompleteUserDetails).to.equal(true);
      expect(isNewUser).to.equal(true);
    });

    it("should update the user collection and unset the flag isNewUser", async function () {
      const userData = userDataArray[0];

      // Add the user the first time
      const { isNewUser } = await users.addOrUpdate(userData);

      // Update the user with same data
      const { isNewUser: updatedIsNewUserFlag } = await users.addOrUpdate(userData);

      expect(isNewUser).to.equal(true);
      expect(updatedIsNewUserFlag).to.equal(false);
    });

    it("should update the user collection when userId is passed", async function () {
      const userData1 = userDataArray[0];
      const userData2 = userDataArray[1];
      const updatedUserData = {};

      Object.assign(updatedUserData, userData1, userData2);

      // Add the user the first time
      const { isNewUser, userId } = await users.addOrUpdate(userData1);

      // Update the user with same data
      const { isNewUser: updatedIsNewUserFlag } = await users.addOrUpdate(userData2, userId);

      const data = (await userModel.doc(userId).get()).data();

      Object.keys(updatedUserData).forEach((key) => {
        expect(updatedUserData[key]).to.deep.equal(data[key]);
      });

      expect(isNewUser).to.equal(true);
      expect(updatedIsNewUserFlag).to.equal(false);
    });

    it("should return the user information when github username is passed", async function () {
      const userData = userDataArray[0];
      await users.addOrUpdate(userData);
      const githubUsername = "ankur";
      const { user, userExists } = await users.fetchUser({ githubUsername });
      expect(user).to.haveOwnProperty("id");
      expect(user).to.haveOwnProperty("username");
      expect(user).to.haveOwnProperty("first_name");
      expect(user).to.haveOwnProperty("last_name");

      expect(user.first_name).to.equal(userData.first_name);
      expect(user.last_name).to.equal(userData.last_name);
      expect(userExists).to.equal(true);
    });
  });
  describe("user image verification", function () {
    let userId, discordId, profileImageUrl, discordImageUrl;
    beforeEach(async function () {
      const docRefUser0 = photoVerificationModel.doc();
      await docRefUser0.set(userPhotoVerificationData);
      userId = newUserPhotoVerificationData.userId;
      discordId = newUserPhotoVerificationData.discordId;
      profileImageUrl = newUserPhotoVerificationData.profile.url;
      discordImageUrl = newUserPhotoVerificationData.discord.url;
    });
    afterEach(async function () {
      await cleanDb();
    });
    it("adds new user images For Verification", async function () {
      const result = await users.addForVerification(userId, discordId, profileImageUrl, discordImageUrl);

      const verificationSnapshot = await photoVerificationModel.where("userId", "==", userId).limit(1).get();
      expect(verificationSnapshot.empty).to.be.equal(false);
      newUserPhotoVerificationData.profile.date = verificationSnapshot.docs[0].data().profile.date;
      newUserPhotoVerificationData.discord.date = verificationSnapshot.docs[0].data().discord.date;
      const docData = verificationSnapshot.docs[0].data();
      expect(docData).to.deep.equal(newUserPhotoVerificationData);

      expect(result.message).to.be.equal("Profile data added for verification successfully");
    });
    it("adds user images For Verification", async function () {
      const userId = "1234567abcd";
      const verificationSnapshotBeforeUpdate = await photoVerificationModel
        .where("userId", "==", userId)
        .limit(1)
        .get();
      const docDataPrev = verificationSnapshotBeforeUpdate.docs[0].data();
      const result = await users.addForVerification(userId, discordId, profileImageUrl, discordImageUrl);

      const verificationSnapshot = await photoVerificationModel.where("userId", "==", userId).limit(1).get();
      const docData = verificationSnapshot.docs[0].data();
      expect(docData).to.have.all.keys(["userId", "discordId", "discord", "profile"]);
      expect(docData.discord.approved).to.be.equal(docDataPrev.discord.approved);
      expect(docData.discord.url).to.be.equal(discordImageUrl);
      expect(docData.profile.url).to.be.equal(profileImageUrl);

      expect(result.message).to.be.equal("Profile data added for verification successfully");
    });
    it("marks user profile image as verified", async function () {
      const userId = "1234567abcd";
      const imageType = "profile";
      const verificationSnapshotBeforeUpdate = await photoVerificationModel
        .where("userId", "==", userId)
        .limit(1)
        .get();
      const docDataPrev = verificationSnapshotBeforeUpdate.docs[0].data();
      const result = await users.markAsVerified(userId, imageType);

      const verificationSnapshot = await photoVerificationModel.where("userId", "==", userId).limit(1).get();
      const docData = verificationSnapshot.docs[0].data();
      expect(docData.profile.approved).to.not.be.equal(docDataPrev.profile.approved);

      expect(result.message).to.be.equal("User image data verified successfully");
    });
    it("throws an error if verification document not found", async function () {
      const userId = "non-existent-userId";
      const imageType = "profile";
      try {
        await users.markAsVerified(userId, imageType);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equal("No verification document record data for user was found");
      }
    });
    it("gets user image verification data", async function () {
      const userId = "1234567abcd";

      const result = await users.getUserImageForVerification(userId);

      const verificationSnapshot = await photoVerificationModel.where("userId", "==", userId).limit(1).get();
      const docData = verificationSnapshot.docs[0].data();
      expect(result).to.deep.equal(docData);
    });
    it("throws an error if verification document could not be found due to invalid user Id", async function () {
      const userId = "non-existent-userId";

      try {
        await users.getUserImageForVerification(userId);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equal(`No document with userId: ${userId} was found!`);
      }
    });

    describe(" search users API: getUsersBasedOnFilter", function () {
      it("should return an empty array if no query is provided", async function () {
        const result = await users.getUsersBasedOnFilter({});
        expect(result).to.deep.equal([]);
      });

      it("should return an array of verified users", async function () {
        const result = await users.getUsersBasedOnFilter({ verified: "true" });
        expect(result).to.deep.equal(userDataArray.filter((user) => user.discordId));
      });
    });
  });
});
