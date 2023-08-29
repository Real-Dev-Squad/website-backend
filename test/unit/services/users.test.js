const Sinon = require("sinon");
const { expect } = require("chai");

const firestore = require("../../../utils/firestore");
const userModel = firestore.collection("users");
const cleanDb = require("../../utils/cleanDb");
const userDataArray = require("../../fixtures/user/user")();
const { archiveUsers, getUserDiscordIdUsername } = require("../../../services/users");

describe("Users services", function () {
  describe("archive inactive discord users in bulk", function () {
    const users = [];
    const userDetails = [];
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

      users.length = 0;
      userDetails.length = 0;

      const snapshot = await userModel
        .where("roles.in_discord", "==", false)
        .where("roles.archived", "==", false)
        .get();

      snapshot.forEach((user) => {
        const id = user.id;
        const userData = user.data();
        const { first_name: firstName, last_name: lastName } = userData;
        users.push({ ...userData, id });
        userDetails.push({ id, firstName, lastName });
      });
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("Should return successful response", async function () {
      const res = await archiveUsers(users);

      expect(res).to.deep.equal({
        message: "Successfully completed batch updates",
        totalUsersArchived: userDetails.length,
        totalOperationsFailed: 0,
        updatedUserDetails: userDetails,
        failedUserDetails: [],
      });
    });

    it("should return failed response", async function () {
      const batchStub = Sinon.stub(firestore, "batch");
      batchStub.returns({
        update: function () {},
        commit: function () {
          throw new Error("Firebase batch operation failed");
        },
      });

      const res = await archiveUsers(users);

      expect(res).to.deep.equal({
        message: "Firebase batch operation failed",
        totalUsersArchived: 0,
        totalOperationsFailed: userDetails.length,
        updatedUserDetails: [],
        failedUserDetails: userDetails,
      });
    });
  });

  /* Skipping since test changes will go through before the util changes */
  describe("getUserDiscordIdUsername", function () {
    const userDetails = [];

    before(async function () {
      const addedUsers = [];

      userDataArray.forEach((user) => {
        addedUsers.push(userModel.add(user));
      });
      await Promise.all(addedUsers);

      const snapshot = await userModel.get();

      snapshot.forEach((user) => {
        const id = user.id;
        const userData = user.data();
        userDetails.push({ ...userData, id });
      });
    });

    afterEach(async function () {
      Sinon.restore();
    });

    it("Should successfully return the username and discordId of the user whose userId is passed", async function () {
      const userData = userDetails.filter((user) => user.discordId)[0];
      const { id: userId, discordId, username } = userData;

      const fetchedUserData = await getUserDiscordIdUsername(userId);

      expect(fetchedUserData).to.have.property("discordId", discordId);
      expect(fetchedUserData).to.have.property("username", username);
    });

    it("Should fail to return the data when userId is invalid", async function () {
      const error = new Error("User data not found! Invalid id passed");
      Sinon.stub(userModel, "get").rejects(error);
      await getUserDiscordIdUsername("randomId").catch((err) => {
        expect(err).to.be.instanceOf(Error);
        expect(err).to.be.deep.equal(err);
      });
    });

    it("Should fail to return the data when userId is valid but username is unavailable", async function () {
      const userData = userDetails.filter((user) => !user.username)[0];
      const { id: userId } = userData;

      await getUserDiscordIdUsername(userId).catch((err) => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.be.equal("Complete user information unavailable!");
      });
    });

    it("Should fail to return the data when userId is valid but discord id is unavailable", async function () {
      const userData = userDetails.filter((user) => !user.discordId)[0];
      const { id: userId } = userData;

      await getUserDiscordIdUsername(userId).catch((err) => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.be.equal("Complete user information unavailable!");
      });
    });

    it("Should fail to return the data when userId is valid but both usernam and discord id are unavailable", async function () {
      const userData = userDetails.filter((user) => !user.discordId && !user.username)[0];
      const { id: userId } = userData;

      await getUserDiscordIdUsername(userId).catch((err) => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.be.equal("Complete user information unavailable!");
      });
    });
  });
});
