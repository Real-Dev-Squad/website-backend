const { expect } = require("chai");
const firestore = require("../../../utils/firestore");
const { setInDiscordFalseScript } = require("../../../services/discordService");
const { fetchAllUsers } = require("../../../models/users");
const userModel = firestore.collection("users");
const userDataArray = require("../../fixtures/user/user")();

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
