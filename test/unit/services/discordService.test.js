const { expect } = require("chai");
const firestore = require("../../../utils/firestore");
const { setInDiscordFalseScript, addRoleToUser, setUserDiscordNickname } = require("../../../services/discordService");
const { fetchAllUsers } = require("../../../models/users");
const Sinon = require("sinon");
const userModel = firestore.collection("users");
const userDataArray = require("../../fixtures/user/user")();
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

  describe("change user nickname", function () {
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

      const response = await setUserDiscordNickname("abcd", 98178);

      expect(response.message).to.be.equal("done");
    });
  });
});
