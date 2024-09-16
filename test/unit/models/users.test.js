/**
 * This eslint rule is disabled because of https://github.com/nodesecurity/eslint-plugin-security/issues/21
 * It gives linting errors in testing the DB data with keys from fixtures
 */
/* eslint-disable security/detect-object-injection */

const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const cleanDb = require("../../utils/cleanDb");
const users = require("../../../models/users");
const firestore = require("../../../utils/firestore");
const { userPhotoVerificationData, newUserPhotoVerificationData } = require("../../fixtures/user/photo-verification");
const { generateStatusDataForState } = require("../../fixtures/userStatus/userStatus");
const userModel = firestore.collection("users");
const userStatusModel = firestore.collection("usersStatus");
const joinModel = firestore.collection("applicants");
const userDataArray = require("../../fixtures/user/user")();
const joinData = require("../../fixtures/user/join")();
const photoVerificationModel = firestore.collection("photo-verification");
const userData = require("../../fixtures/user/user");
const addUser = require("../../utils/addUser");
const { userState } = require("../../../constants/userStatus");
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

    it("It should have created_At and updated_At fields", async function () {
      const userData = userDataArray[15];
      await users.addOrUpdate(userData);
      const githubUsername = "sahsisunny";
      const { user, userExists } = await users.fetchUser({ githubUsername });
      expect(user).to.haveOwnProperty("created_at");
      expect(user).to.haveOwnProperty("updated_at");
      expect(userExists).to.equal(true);
    });

    it("It should have github_created_at fields", async function () {
      const userData = userDataArray[0];
      await users.addOrUpdate(userData);
      const githubUsername = "ankur";
      const { user } = await users.fetchUser({ githubUsername });
      expect(user).to.haveOwnProperty("github_created_at");
    });
  });

  describe("fetch user details based on discord id", function () {
    let [userId0] = [];

    beforeEach(async function () {
      const userArr = userData();
      userId0 = await addUser(userArr[0]);
      await userStatusModel.doc("userStatus000").set(generateStatusDataForState(userId0, userState.IDLE));
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("It should fetch users who have archived:false role", async function () {
      const result = await users.fetchUser({ discordId: "12345" });
      expect(result.user.roles.archived).to.equal(false);
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
            archived: false,
          },
        };
        addUsersPromises.push(userModel.add(userData));
      });

      await Promise.all(addUsersPromises);
    });

    afterEach(function () {
      sinon.restore();
    });

    it("should update archived role to true if in_discord is false", async function () {
      await users.archiveUserIfNotInDiscord();

      const updatedUsers = await userModel
        .where("roles.in_discord", "==", false)
        .where("roles.archived", "==", false)
        .get();

      updatedUsers.forEach((user) => {
        const userData = user.data();
        expect(userData.roles.in_discord).to.be.equal(false);
        expect(userData.roles.archived).to.be.equal(true);
      });
    });

    it("should throw an error if firebase batch operation fails", async function () {
      const stub = sinon.stub(firestore, "batch");
      stub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firestore batch update failed");
        },
      });

      try {
        await users.archiveUserIfNotInDiscord();
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal("An internal server error occurred");
      }

      const updatedUsers = await userModel
        .where("roles.in_discord", "==", false)
        .where("roles.archived", "==", false)
        .get();

      updatedUsers.forEach((user) => {
        const userData = user.data();
        expect(userData.roles.in_discord).to.be.equal(false);
        expect(userData.roles.archived).to.be.not.equal(true);
      });
    });
  });

  describe("get users by roles", function () {
    beforeEach(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user) => {
        addUsersPromises.push(userModel.add(user));
      });
      await Promise.all(addUsersPromises);
    });

    it("returns users with member role", async function () {
      const members = await users.getUsersByRole("member");
      expect(members.length).to.be.equal(7);
      members.forEach((member) => {
        expect(member.roles.member).to.be.equal(true);
      });
    });

    it("throws an error", async function () {
      await users.getUsersByRole(32389434).catch((err) => {
        expect(err).to.be.instanceOf(Error);
      });
    });
  });

  describe("getUsersBasedOnFilter", function () {
    let [userId0, userId1, userId2] = [];

    beforeEach(async function () {
      const userArr = userData();
      userId0 = await addUser(userArr[0]);
      userId1 = await addUser(userArr[1]);
      userId2 = await addUser(userArr[2]);
      await userStatusModel.doc("userStatus000").set(generateStatusDataForState(userId0, userState.ONBOARDING));
      await userStatusModel.doc("userStatus001").set(generateStatusDataForState(userId1, userState.ONBOARDING));
      await userStatusModel.doc("userStatus002").set(generateStatusDataForState(userId2, userState.IDLE));
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("should render users with onboarding state and time as 31days", async function () {
      const query = {
        state: "ONBOARDING",
        time: "31d",
      };
      const result = await users.getUsersBasedOnFilter(query);
      expect(result.length).to.equal(1);
    });
  });

  describe("fetch users by id", function () {
    let allIds = [];

    before(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user, index) => {
        addUsersPromises.push(userModel.add({ ...user }));
      });
      const responses = await Promise.all(addUsersPromises);
      allIds = responses.map((response) => response.id);
    });

    after(async function () {
      await cleanDb();
    });

    it("should fetch the details of users whose ids are present in the array", async function () {
      const randomIds = allIds.sort(() => 0.5 - Math.random()).slice(0, 3); // Select random ids from allIds
      const result = await users.fetchUserByIds(randomIds);
      expect(result).to.be.an("array");
    });

    it("should return empty object if no ids are passed", async function () {
      const result = await users.fetchUserByIds();
      const fetchedUserIds = Object.keys(result);
      expect(fetchedUserIds).to.deep.equal([]);
    });
  });

  describe("updateUsersInBatch", function () {
    it("should update existing users", async function () {
      const addUserPromiseList = [];
      for (const user of userDataArray) {
        const addUserPromise = users.addOrUpdate(user);
        addUserPromiseList.push(addUserPromise);
      }

      await Promise.all(addUserPromiseList);

      const usersList = [];
      const usersQuerySnapshot = await userModel.get();
      usersQuerySnapshot.forEach((user) => usersList.push({ ...user.data(), id: user.id, status: "inactive" }));

      await users.updateUsersInBatch(usersList);

      const updatedUserList = [];
      const updatedUserQuerySnapshot = await userModel.get();
      updatedUserQuerySnapshot.forEach((user) => updatedUserList.push({ ...user.data(), id: user.id }));

      const isAllUserStatusInactive = updatedUserList.every((user) => {
        return !!user.status && user.status === "inactive";
      });

      expect(isAllUserStatusInactive).to.be.equal(true);
    });
  });

  describe("fetchUsersListForMultipleValues", function () {
    it("should fetch users for all the given id list", async function () {
      const actualUserList = [userDataArray[0], userDataArray[1], userDataArray[2]];

      const addUserPromiseList = [];
      for (const user of actualUserList) {
        const addUserPromise = users.addOrUpdate(user);
        addUserPromiseList.push(addUserPromise);
      }
      await Promise.all(addUserPromiseList);

      const discordIdList = actualUserList.map((user) => user.discordId);

      const userListResult = await users.fetchUsersListForMultipleValues("discordId", discordIdList);

      expect(userListResult.length).to.be.equal(3);
      const resultDiscordIdList = userListResult.map((user) => user.discordId);
      resultDiscordIdList.sort();
      discordIdList.sort();
      expect(resultDiscordIdList).to.be.deep.equal(discordIdList);
    });
  });

  describe("fetchUserForKeyValue", function () {
    it("should fetch users for the given id", async function () {
      await users.addOrUpdate(userDataArray[0]);

      const userListResult = await users.fetchUserForKeyValue("discordId", userDataArray[0].discordId);

      expect(userListResult.length).to.be.equal(1);
      expect(userListResult[0].discordId).to.be.deep.equal(userDataArray[0].discordId);
    });
  });

  describe("fetchUser with disabled roles", function () {
    afterEach(async function () {
      await cleanDb();
    });

    it("should fetch users with modified roles : []", async function () {
      const superUser = { ...userData()[4], disabled_roles: [] };
      const userId = await addUser(superUser);

      const userDoc = await users.fetchUser({ userId });
      expect(userDoc.user.disabled_roles.length).to.be.equal(0);
      expect(userDoc.user.roles.super_user).to.be.equal(true);
    });

    it("should fetch users with modified roles : super_user", async function () {
      const superUser = { ...userData()[4], disabled_roles: ["super_user"] };
      const userId = await addUser(superUser);

      const userDoc = await users.fetchUser({ userId });
      expect(userDoc.user.disabled_roles.length).to.be.equal(1);
      expect(userDoc.user.roles.super_user).to.be.equal(false);
    });

    it("should fetch users with modified roles : member", async function () {
      const memberUser = { ...userData()[6], disabled_roles: ["member"] };
      const userId = await addUser(memberUser);

      const userDoc = await users.fetchUser({ userId });
      expect(userDoc.user.disabled_roles.length).to.be.equal(1);
      expect(userDoc.user.roles.member).to.be.equal(false);
    });

    it("should fetch users with modified roles : super_user & member", async function () {
      const userWithBothRoles = {
        ...userData()[4],
        disabled_roles: ["super_user", "member"],
        roles: { ...userData()[4].roles, member: true },
      };

      const userId = await addUser(userWithBothRoles);

      const userDoc = await users.fetchUser({ userId });
      expect(userDoc.user.disabled_roles.length).to.be.equal(2);
      expect(userDoc.user.roles.member).to.be.equal(false);
      expect(userDoc.user.roles.super_user).to.be.equal(false);
    });
  });
});
