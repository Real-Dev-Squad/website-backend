const Sinon = require("sinon");
const { expect } = require("chai");

const firestore = require("../../../utils/firestore");
const userModel = firestore.collection("users");
const cleanDb = require("../../utils/cleanDb");
const userDataArray = require("../../fixtures/user/user")();
const { archiveInactiveDiscordUsersInBulk } = require("../../../services/users");

describe("Users services", function () {
  describe("archive inactive discord users in bulk", function () {
    const users = [];
    const userIds = [];
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

      const snapshot = await userModel
        .where("roles.in_discord", "==", false)
        .where("roles.archived", "==", false)
        .get();

      snapshot.forEach((user) => {
        const id = user.id;
        const userData = user.data();
        users.push({ ...userData, id });
        userIds.push(id);
      });
    });

    afterEach(async function () {
      await cleanDb();
      Sinon.restore();
    });

    it("Should return successful response", async function () {
      const res = await archiveInactiveDiscordUsersInBulk(users);

      expect(res).deep.equal({
        message: "Successfully completed batch updates",
        totalUsersArchived: 14,
        totalOperationsFailed: 0,
        updatedUserIds: userIds,
      });
    });

    it("should return failed response", async function () {
      const batchStub = Sinon.stub(firestore, "batch");
      batchStub.returns({
        update: function () {},
      });

      const res = await archiveInactiveDiscordUsersInBulk(users);

      expect(res).deep.equal({
        message: "Firebase batch operation failed",
        totalUsersArchived: 0,
        totalOperationsFailed: 14,
        updatedUserIds: [],
      });
    });
  });
});
