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
const { userPhotoVerificationData } = require("../../fixtures/user/photo-verification");
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
const { photoVerificationRequestStatus } = require("../../../constants/users");
const app = require("../../../server");
const prodUsers = require("../../fixtures/user/prodUsers");
const authService = require("../../../services/authService");
const cookieName = config.get("userToken.cookieName");
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
    let photoVerificationData = {};

    beforeEach(async function () {
      const userData = userDataArray[0];
      const { userId } = await users.addOrUpdate(userData);

      const photoVerificationDataFix = userPhotoVerificationData[0];
      photoVerificationDataFix.userId = userId;

      const docRefUser0 = photoVerificationModel.doc();
      await docRefUser0.set(photoVerificationDataFix);
      photoVerificationData = userPhotoVerificationData[0];
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("adds new user images For Verification", async function () {
      const userId = photoVerificationData.userId;
      const result = await users.addForVerification(
        photoVerificationData.userId,
        photoVerificationData.discordId,
        photoVerificationData.profile.url,
        photoVerificationData.discord.url,
        photoVerificationData.profile.publicId
      );

      const verificationSnapshot = await photoVerificationModel.where("userId", "==", userId).limit(1).get();
      expect(verificationSnapshot.empty).to.be.equal(false);
      photoVerificationData.profile.date = verificationSnapshot.docs[0].data().profile.date;
      photoVerificationData.discord.date = verificationSnapshot.docs[0].data().discord.date;
      const docData = verificationSnapshot.docs[0].data();
      expect(docData).to.deep.equal(photoVerificationData);

      expect(result.message).to.be.equal("Profile data added for verification successfully");
    });

    it("marks user profile image as verified", async function () {
      const userId = photoVerificationData.userId;
      const imageType = "profile";
      const verificationSnapshotBeforeUpdate = await photoVerificationModel
        .where("userId", "==", userId)
        .where("status", "==", photoVerificationRequestStatus.PENDING)
        .limit(1)
        .get();

      const docRef = verificationSnapshotBeforeUpdate.docs[0].ref;

      const docDataPrev = (await docRef.get()).data();
      const result = await users.changePhotoVerificationStatus(
        userId,
        imageType,
        photoVerificationRequestStatus.APPROVED
      );

      const docData = (await docRef.get()).data();
      expect(docData.profile.approved).to.not.be.equal(docDataPrev.profile.approved);
      expect(docData.profile.approved).to.be.equal(true);

      expect(result).to.be.equal("User image data verified successfully");
    });

    it("adds user images For Verification, updates the pending verification object", async function () {
      const userId = photoVerificationData.userId;
      const imageType = "profile";
      const verificationSnapshotBeforeUpdate = await photoVerificationModel
        .where("userId", "==", userId)
        .limit(1)
        .get();

      // Update the status of the profile image to approved
      await users.changePhotoVerificationStatus(userId, imageType, photoVerificationRequestStatus.APPROVED);

      const docRef = verificationSnapshotBeforeUpdate.docs[0].ref;

      const docDataPrev = (await docRef.get()).data();
      const result = await users.addForVerification(
        photoVerificationData.userId,
        photoVerificationData.discordId,
        photoVerificationData.profile.url,
        photoVerificationData.discord.url,
        photoVerificationData.profile.publicId
      );

      const docData = (await docRef.get()).data();
      expect(docData).to.have.all.keys(["userId", "discordId", "discord", "profile", "status"]);
      expect(docData.discord.approved).to.be.equal(docDataPrev.discord.approved);
      expect(docData.discord.url).to.be.equal(photoVerificationData.discord.url);
      expect(docData.profile.url).to.be.equal(photoVerificationData.profile.url);
      expect(docDataPrev.profile.approved).to.be.equal(true);
      expect(docData.profile.approved).to.be.equal(false);

      expect(result.message).to.be.equal("Profile data added for verification successfully");
    });

    it("marks photo verification object status as APPROVED", async function () {
      const imageType = "both";
      const userId = photoVerificationData.userId;
      const verificationSnapshotBeforeUpdate = await photoVerificationModel
        .where("userId", "==", userId)
        .where("status", "==", photoVerificationRequestStatus.PENDING)
        .limit(1)
        .get();

      const docRef = verificationSnapshotBeforeUpdate.docs[0].ref;
      const result = await users.changePhotoVerificationStatus(
        userId,
        imageType,
        photoVerificationRequestStatus.APPROVED
      );

      const docData = (await docRef.get()).data();
      expect(docData.profile.approved).to.be.equal(true);
      expect(docData.discord.approved).to.be.equal(true);
      expect(docData.status).to.be.equal(photoVerificationRequestStatus.APPROVED);

      expect(result).to.be.equal("User image data verified successfully");
    });

    it("marks photo verification object status as APPROVED, when both images are approved one by one", async function () {
      const userId = photoVerificationData.userId;
      let imageType = "profile";
      const verificationSnapshotBeforeUpdate = await photoVerificationModel
        .where("userId", "==", userId)
        .limit(1)
        .get();

      const docRef = verificationSnapshotBeforeUpdate.docs[0].ref;
      await users.changePhotoVerificationStatus(userId, imageType, photoVerificationRequestStatus.APPROVED);

      let docData = (await docRef.get()).data();
      expect(docData.profile.approved).to.be.equal(true);
      expect(docData.discord.approved).to.be.equal(false);
      expect(docData.status).to.be.equal(photoVerificationRequestStatus.PENDING);

      imageType = "discord";
      await users.changePhotoVerificationStatus(userId, imageType, photoVerificationRequestStatus.APPROVED);
      docData = (await docRef.get()).data();
      expect(docData.profile.approved).to.be.equal(true);
      expect(docData.discord.approved).to.be.equal(true);
      expect(docData.status).to.be.equal(photoVerificationRequestStatus.APPROVED);
    });

    it("throws an error if verification document not found", async function () {
      const userId = "non-existent-userId";
      const imageType = "profile";
      try {
        await users.changePhotoVerificationStatus(userId, imageType, photoVerificationRequestStatus.APPROVED);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.be.equal("No verification document record data for user was found");
      }
    });

    it("gets user image verification data", async function () {
      const userId = photoVerificationData.userId;

      const result = (await users.getUserPhotoVerificationRequests(userId))[0];

      const verificationSnapshot = await photoVerificationModel.where("userId", "==", userId).limit(1).get();
      const docData = verificationSnapshot.docs[0].data();
      expect(result.profile.url).to.deep.equal(docData.profile.url);
      expect(result.profile.publicId).to.deep.equal(docData.profile.publicId);
      expect(result.discord.url).to.deep.equal(docData.discord.url);
      expect(result.discordId).to.deep.equal(docData.discordId);
      expect(result.userId).to.deep.equal(docData.userId);
      expect(result.status).to.deep.equal(docData.status);
    });

    it("throws an error if verification document could not be found due to invalid user Id", async function () {
      const userId = "non-existent-userId";

      try {
        await users.getUserPhotoVerificationRequests(userId);
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

  describe("generateUniqueUsername", function () {
    it("should generate a unique username when existing users are present", async function () {
      const userData = userDataArray[15];
      await users.addOrUpdate(userData);
      const newUsername = await users.generateUniqueUsername("shubham", "sigdar");
      expect(newUsername).to.deep.equal("shubham-sigdar-2");
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

  describe("Adding github_user_id for each user document", function () {
    let userId, userToken, superUserId, superUserToken;

    beforeEach(async function () {
      userId = await addUser(prodUsers[1]);
      userToken = authService.generateAuthToken({ userId: userId });
      superUserId = await addUser(prodUsers[0]);
      superUserToken = authService.generateAuthToken({ userId: superUserId });
    });

    afterEach(async function () {
      await cleanDb();
    });

    it("Migration API should not be accessible by any regular user", function (done) {
      chai
        .request(app)
        .post("/users/migrations?action=adds-github-id&page=0&size=10")
        .set("cookie", `${cookieName}=${userToken}`)
        .send()
        .end((err, res) => {
          if (err) {
            return done();
          }
          expect(res).to.have.status(401);
          expect(res.body).to.be.an("object");
          expect(res.body).to.eql({
            statusCode: 401,
            error: "Unauthorized",
            message: "You are not authorized for this action.",
          });
          return done();
        });
    });

    it("Migration API should be not be accessible with invalid query params", async function () {
      const res = await chai
        .request(app)
        .post("/users/migrations")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send();
      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message");
      expect(res.body).to.have.property("error");
      expect(res.body.message).to.equal("Invalid Query Parameters Passed");
      expect(res.body.error).to.equal("Bad Request");
    });

    it("Migration API should be accessible by super user", async function () {
      const res = await chai
        .request(app)
        .post("/users/migrations?action=adds-github-id&page=0&size=10")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send();
      expect(res).to.have.status(200);
    });

    it("Migration API to add github_user_id should work", async function () {
      for (const user of prodUsers.slice(2)) {
        await addUser(user);
      }
      const allUsers = await chai.request(app).get("/users").set("cookie", `${cookieName}=${superUserToken}`).send();
      const usersWithoutGithubId = allUsers.body.users.filter((user) => {
        return !user.github_user_id;
      });

      expect(usersWithoutGithubId).to.not.have.length(0);

      const res = await chai
        .request(app)
        .post("/users/migrations?action=adds-github-id&page=0&size=10")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send();

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("data").that.is.an("object");
      expect(res.body.data).to.have.property("totalUsers").that.is.a("number");
      expect(res.body.data).to.have.property("usersUpdated").that.is.a("number");
      expect(res.body.data).to.have.property("usersNotUpdated").that.is.a("number");
      expect(res.body.data).to.have.property("invalidUsersDetails").that.is.an("array");

      const updatedUsers = await chai
        .request(app)
        .get("/users")
        .set("cookie", `${cookieName}=${superUserToken}`)
        .send();

      const updatedUsersWithoutGithubId = updatedUsers.body.users.filter((user) => {
        return !user.github_user_id;
      });
      // For invalid username
      expect(updatedUsersWithoutGithubId).to.have.length(1);
    });
  });
});
