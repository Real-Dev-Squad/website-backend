const chai = require("chai");
const expect = chai.expect;
const cleanDb = require("../../utils/cleanDb");
const { addGroupRoleToMember } = require("../../../models/discordactions");
const { getUserIdsFromRoleId } = require("../../../services/getUserIdsFromRoleId");

describe("FCM token services", function () {
  describe("get user id from role id", function () {
    beforeEach(async function () {});
    afterEach(async function () {
      await cleanDb();
    });
  });
  it("Should get user id's from role id", async function () {
    const memberRoleModelData = {
      roleid: "1147354535342383104",
      userid: "jskdhaskjhdkasjh",
    };
    await addGroupRoleToMember(memberRoleModelData);
    const memberRoleModelData2 = {
      roleid: "1147354535342383104",
      userid: "EFEGFHERIUGHIUER",
    };
    await addGroupRoleToMember(memberRoleModelData2);

    const res = await getUserIdsFromRoleId("1147354535342383104");

    expect(res.length).equals(2);
    expect(res).includes("EFEGFHERIUGHIUER");
    expect(res).includes("jskdhaskjhdkasjh");
  });

  it("will return blank array for invalid role id", async function () {
    const userId = await getUserIdsFromRoleId("sdkfskf");
    expect(userId.length).equals(0);
  });
});
