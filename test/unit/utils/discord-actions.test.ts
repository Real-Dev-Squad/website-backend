import chai from "chai";
import sinon from "sinon";
const { expect } = chai;
import { generateDiscordInviteLink } from "../../../utils/discord-actions";

describe("generateDiscordInviteLink", () => {
  let fetchStub;

  beforeEach(function () {
    fetchStub = sinon.stub(global, "fetch");
  });
  afterEach(function () {
    fetchStub.restore();
  });

  it("should return the invite link", async () => {
    const inviteLink = "discord.gg/123456789";
    const discordInviteLink = {
      data: {
        code: "123456789",
      },
    };
    fetchStub.resolves({
      ok: true,
      json: () => discordInviteLink,
    });

    const result = await generateDiscordInviteLink();
    expect(result).to.be.equal(inviteLink);
  });

  it("should  resolve with an error", async () => {
    const error = new Error("Error");
    fetchStub.rejects(error);
    try {
      await generateDiscordInviteLink();
    } catch (err) {
      expect(err).to.be.equal(error);
    }
  });
});
