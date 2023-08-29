const { expect } = require("chai");
const firestore = require("../../../utils/firestore");
const {
  setInDiscordFalseScript,
  addRoleToUser,
  getDiscordMembers,
  removeRoleFromUser,
} = require("../../../services/discordService");
const { fetchAllUsers } = require("../../../models/users");
const Sinon = require("sinon");
const userModel = firestore.collection("users");
const userDataArray = require("../../fixtures/user/user")();
const discordMembersArray = require("../../fixtures/discordResponse/discord-response");
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
        expect(user.updated_at).to.be.a("number");
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
});
