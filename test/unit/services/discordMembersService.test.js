const chai = require("chai");
const { expect } = chai;
const chaiHttp = require("chai-http");

const { getDiscordMemberDetails } = require("../../../services/discordMembersService");

chai.use(chaiHttp);

// const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");

describe("discordMemberServce", function () {
  it("should generate valid member details generated JWT", function (done) {
    const payload = 12345;
    const memberDetails = getDiscordMemberDetails(payload);

    expect(memberDetails).to.have.all.keys("userId", "iat", "exp");

    return done();
  });

  // it("should decode the generated JWT", function (done) {
  //   const payload = { userId: 1 };
  //   const jwt = authService.generateAuthToken(payload);
  //   const decodedValue = authService.decodeAuthToken(jwt);

  //   expect(decodedValue).to.have.all.keys("userId", "iat", "exp");
  //   expect(decodedValue.userId).to.equal(payload.userId);

  //   return done();
  // });
});
