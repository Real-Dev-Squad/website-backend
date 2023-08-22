const Sinon = require("sinon");
const { expect } = require("chai");

const firestore = require("../../../utils/firestore");
const userModel = firestore.collection("users");
const cleanDb = require("../../utils/cleanDb");
const userDataArray = require("../../fixtures/user/user")();
const { archiveUsers } = require("../../../services/users");

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
        totalUsersArchived: 16,
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
        totalOperationsFailed: 16,
        updatedUserDetails: [],
        failedUserDetails: userDetails,
      });
    });
  });

  /* Skipping since test changes will go through before the util changes */
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("getUserDiscordIdUsername", function () {
    const userDetails = [];

    before(async function () {
      const addedUsers = [];

      userDataArray.forEach((user) => {
        addedUsers.push(userModel.add(user));
      });
      const userInfo = await Promise.all(addedUsers);
      userDetails.push(userInfo);
    });

    afterEach(async function () {
      Sinon.restore();
    });

    it("Should successfully return the username and discordId of the user whose userId is passed", async function () {});

    it("Should fail to return the data when userId is invalid", async function () {});

    it("Should fail to return the data when userId is valid but username is unavailable", async function () {});

    it("Should fail to return the data when userId is valid but discord id is unavailable", async function () {
      // const userWithoutUserName = {
      //   first_name: "John",
      //   last_name: "Doe",
      //   discordId: "12345",
      // };
    });

    it("Should fail to return the data when userId is valid but both usernam and discord id are unavailable", async function () {
      // const userWithoutDiscordIdAndUsername = {
      //   first_name: "Jane",
      //   last_name: "Doe",
      // };
    });
  });
});
