const { expect } = require("chai");
const { updateDiscordUserNickname } = require("../../../services/usersStatusService");
const Sinon = require("sinon");
const userDataArray = require("../../fixtures/user/user")();
const { generateOOONickname } = require("../../../utils/userStatus");
let fetchStub;

/* Skipping since test changes will go through before the discordService changes */
describe("Users status services", function () {
  describe("updateDiscordUserNickname", function () {
    beforeEach(function () {
      fetchStub = Sinon.stub(global, "fetch");
    });

    afterEach(function () {
      fetchStub.restore();
    });

    it("Changes the nickname of the user whose discordId is passed and returns positive response", async function () {
      const responseObject = { message: ["User nickname changed successfully"] };
      const { username, discordId } = userDataArray[0];
      const from = new Date().getTime();
      const until = new Date().getTime();

      fetchStub.returns(
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve(responseObject),
        })
      );

      const nickname = generateOOONickname(username, from, until);
      const response = await updateDiscordUserNickname(discordId, nickname);

      expect(response).to.deep.equal(responseObject);
      expect(fetchStub.calledOnce).to.be.equal(true);
    });

    it("Fails to update nickname of the user and returns error", async function () {
      const errorMessage = "🚫 Bad Request Signature";
      fetchStub.rejects(
        new Error({
          error: errorMessage,
        })
      );

      const { username, discordId } = userDataArray[0];
      updateDiscordUserNickname(discordId, username).catch((error) => {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal(errorMessage);
      });
    });
  });
});
