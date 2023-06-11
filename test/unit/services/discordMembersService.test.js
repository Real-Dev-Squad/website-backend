const chai = require("chai");
const chaiHttp = require("chai-http");
const sinon = require("sinon");
const { getDiscordMemberDetails } = require("../../../services/discordMembersService");

chai.use(chaiHttp);
const expect = chai.expect;

describe("getDiscordMemberDetails", function () {
  let fetchStub;

  before(function () {
    fetchStub = sinon.stub(global, "fetch");
  });

  after(function () {
    fetchStub.restore();
  });

  it("should return the discord data of a user", async function () {
    const discordId = "1234567890";
    const expectedMemberDetails = {
      discordId: discordId,
      username: "Test User",
      discriminator: "0001",
    };

    fetchStub.returns(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve(expectedMemberDetails),
      })
    );

    const response = await getDiscordMemberDetails(discordId);

    expect(response).to.deep.equal(expectedMemberDetails);
  });

  it("should throw an error if the user does not exist", async function () {
    const discordId = "9876543210";

    fetchStub.returns(
      Promise.resolve({
        status: 404,
        json: () => Promise.resolve({ message: "User does not exist" }),
      })
    );

    try {
      await getDiscordMemberDetails(discordId);
    } catch (err) {
      expect(err.message).to.equal("User does not exist");
    }
  });
  it("should throw an error", async function () {
    const discordId = "memberId123";
    const expectedError = new Error("Test error");

    fetchStub.throws(expectedError);
    try {
      await getDiscordMemberDetails(discordId);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect(error.message).to.be.equal("Test error");
    }
  });
});
