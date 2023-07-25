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
const joinModel = firestore.collection("applicants");
const userDataArray = require("../../fixtures/user/user")();
const joinData = require("../../fixtures/user/join")();
const photoVerificationModel = firestore.collection("photo-verification");

/**
 * Test the model functions and validate the data stored
 */

describe("users", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("addOrUpdate", function () {
    it("should add the user collection and set the flag incompleteUserDetails and isNewUser and in_discord", async function () {
      const userData = userDataArray[0];
      const { isNewUser, userId } = await users.addOrUpdate(userData);

      const data = (await userModel.doc(userId).get()).data();

      Object.keys(userData).forEach((key) => {
        expect(userData[key]).to.deep.equal(data[key]);
      });

      expect(data.incompleteUserDetails).to.equal(true);
      expect(isNewUser).to.equal(true);
      expect(data.roles.in_discord).to.equal(false);
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
  });

  describe("fetchAllUsers", function () {
    beforeEach(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user) => {
        addUsersPromises.push(userModel.add(user));
      });
      await Promise.all(addUsersPromises);
    });

    it("gets all users from user model", async function () {
      const result = await users.fetchAllUsers();
      expect(result).to.have.length(userDataArray.length);
    });
  });

  describe("add Join Data", function () {
    it("adds join data", async function () {
      joinData[0].userId = "12345";
      await users.addJoinData(joinData[0]);
      const savedJoinedData = await joinModel.where("userId", "==", "12345").get();
      savedJoinedData.forEach((data) => {
        expect(data.data()).to.have.all.keys(Object.keys(joinData[0]));
      });
    });
  });

  describe("get join data", function () {
    beforeEach(async function () {
      joinData[0].userId = "12345";
      await users.addJoinData(joinData[0]);
    });
    it("gets joinData", async function () {
      const data = await users.getJoinData("12345");
      expect(data.length).to.be.equal(1);
      expect(data[0]).to.have.all.keys([...Object.keys(joinData[0]), "id"]);
    });
  });

  describe("archive user if not in discord", function () {
    beforeEach(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user) => {
        const userData = {
          ...user,
          roles: {
            ...user.roles,
            in_discord: false,
            archived: user?.roles?.archived || false,
          },
        };
        addUsersPromises.push(userModel.add(userData));
      });

      await Promise.all(addUsersPromises);
    });

    it("should update archived role to true if in_discord is false", async function () {
      await users.archiveUserIfNotInDiscord();

      const updatedUsers = await users.fetchAllUsers();

      updatedUsers.forEach((user) => {
        expect(user.roles.in_discord).to.be.equal(false);
        expect(user.roles.archived).to.be.equal(true);
      });
    });
  });

  describe("remove github token from users", function () {
    beforeEach(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user) => {
        addUsersPromises.push(userModel.add(user));
      });
      await Promise.all(addUsersPromises);
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("return array of users", async function () {
      const data = await users.fetchUsersWithToken();
      expect(data).to.be.not.equal(null);
    });
    it('removes token field from user"s data', async function () {
      const userRef = await users.fetchUsersWithToken();
      const dataBefore = await userRef[1].get();
      const beforeRemoval = Object.keys(dataBefore.data()).includes("tokens");
      expect(beforeRemoval).to.be.equal(true);
      await users.removeGitHubToken(userRef);
      const dataAfter = await userRef[1].get();
      const afterRemoval = Object.keys(dataAfter.data()).includes("tokens");
      expect(afterRemoval).to.be.equal(false);
    });

    it("throws error if id is not found in db", async function () {
      try {
        await users.removeGitHubToken("1223");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });
  });
});
