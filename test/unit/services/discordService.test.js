const { expect } = require("chai");
const firestore = require("../../../utils/firestore");
const {
  setInDiscordFalseScript,
  addRoleToUser,
  getDiscordMembers,
  removeRoleFromUser,
  archiveInactiveDiscordUsersInBulk,
} = require("../../../services/discordService");
const { fetchAllUsers } = require("../../../models/users");
const Sinon = require("sinon");
const userModel = firestore.collection("users");
const userDataArray = require("../../fixtures/user/user")();
const discordMembersArray = require("../../fixtures/discordResponse/discord-response");
const cleanDb = require("../../utils/cleanDb");
let fetchStub;
describe("Discord services", function () {
  describe("setInDiscordFalseScript", function () {
    beforeEach(async function () {
      const addUsersPromises = [];
      userDataArray.forEach((user) => {
        addUsersPromises.push(userModel.add(user));
      });
      await Promise.all(addUsersPromises);
    });
    it("sets in_discord false for each user", async function () {
      await setInDiscordFalseScript();
      const updatedUsers = await fetchAllUsers();
      updatedUsers.forEach((user) => {
        expect(user.roles.in_discord).to.be.equal(false);
      });
    });
  });
  describe("add role to user", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
    });
    afterEach(function () {
      fetchStub.restore();
    });
    it("makes a fetch call", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ message: "done" }),
        })
      );

      const response = await addRoleToUser("123456789", "987654321");

      expect(response.message).to.be.equal("done");
    });
  });

  describe("get discord members", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
    });
    afterEach(function () {
      fetchStub.restore();
    });
    it("Gets all the members from discord server", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(discordMembersArray.getDiscordMembers),
        })
      );

      const response = await getDiscordMembers();
      expect(response).to.deep.equal(discordMembersArray.getDiscordMembers);
      expect(fetchStub.calledOnce).to.be.equal(true);
    });

    it("fails to get discord members", async function () {
      fetchStub.rejects(new Error("Fetch call error"));
      getDiscordMembers().catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Fetch call error");
      });
    });
  });

  describe("remove role from a user", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
    });
    afterEach(function () {
      fetchStub.restore();
    });
    it("makes a successful fetch call to discord", async function () {
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              message: "Role Removed Successfully",
              userAffected: { userid: "987654321123456789", roleid: "112233445566778899" },
            }),
        })
      );
      const response = await removeRoleFromUser("112233445566778899", "987654321123456789");
      expect(response).to.deep.equal({
        message: "Role Removed Successfully",
        userAffected: { userid: "987654321123456789", roleid: "112233445566778899" },
      });
      expect(fetchStub.calledOnce).to.be.equal(true);
    });

    it("makes a failing fetch call to discord", async function () {
      fetchStub.rejects(new Error("Fetch Error"));
      removeRoleFromUser("", "").catch((err) => {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal("Fetch error");
      });
    });
  });

  describe("archive inactive discord users in bulk", function () {
    const users = [];
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
      });
    });
  });
});
