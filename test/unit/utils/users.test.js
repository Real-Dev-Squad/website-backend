const chai = require("chai");
const { expect } = chai;

const sinon = require("sinon");
const usersUtils = require("../../../utils/users");
const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const userData = require("../../fixtures/user/user")()[0];
/**
 * Test the utils functions and validate the data returned
 */

describe("users", function () {
  let userId;
  const taskData = {
    title: "Test task",
    purpose: "To Test mocha",
    featureUrl: "<testUrl>",
    type: "Dev | Group",
    links: ["test1"],
    endsOn: "<unix timestamp>",
    startedOn: "<unix timestamp>",
    status: "active",
    ownerId: "ankur",
    percentCompleted: 10,
    dependsOn: ["d12", "d23"],
    participants: ["ankur"],
    completionAward: { gold: 3, bronze: 300 },
    lossRate: { gold: 1 },
    isNoteworthy: true,
  };

  beforeEach(async function () {
    userId = await addUser();
  });

  afterEach(async function () {
    await cleanDb();
  });

  describe("getUsername", function () {
    it("should receive userId of user from database and return username", async function () {
      const convertedUsername = await usersUtils.getUsername(userId);
      expect(convertedUsername).to.equal(userData.username);
    });
  });

  describe("getUserId", function () {
    it("should receive username of user and return userId", async function () {
      const convertedUserId = await usersUtils.getUserId(userData.username);
      expect(convertedUserId).to.equal(userId);
    });
  });

  describe("getParticipantUsernames", function () {
    it("should receive userId of users from database and return their usernames", async function () {
      const participantUsername = await usersUtils.getParticipantUsernames([userId]);
      expect(participantUsername).to.include(userData.username);
    });
  });

  describe("getParticipantUserIds", function () {
    it("should receive usernames of users from participant array and return their userIds", async function () {
      const participantArray = taskData.participants;
      const participantUserId = await usersUtils.getParticipantUserIds(participantArray);
      expect(participantUserId).to.include(userId);
    });
  });

  describe("mapDiscordMembersDataAndSyncRole", function () {
    it("should update roles and joined_discord fields for users with matching Discord IDs", function () {
      const allUsers = [
        {
          data: () => ({ roles: { archived: false }, discordId: "123" }),
          ref: { update: sinon.spy() },
        },
      ];
      const discordMembers = [
        {
          user: { id: "123" },
          joined_at: "2022-05-01T00:00:00.000Z",
        },
      ];

      usersUtils.mapDiscordMembersDataAndSyncRole(allUsers, discordMembers);

      sinon.assert.calledWithExactly(allUsers[0].ref.update, {
        roles: { archived: false, in_discord: true },
        joined_discord: discordMembers[0].joined_at,
      });
    });

    it("should update roles field to in_discord: false for users with no matching Discord ID", function () {
      const allUsers = [
        {
          data: () => ({ roles: { archived: false }, discordId: "123" }),
          ref: { update: sinon.spy() },
        },
      ];
      const discordMembers = [];

      usersUtils.mapDiscordMembersDataAndSyncRole(allUsers, discordMembers);

      sinon.assert.calledWithExactly(allUsers[0].ref.update, {
        roles: { archived: false, in_discord: false },
      });
    });

    it("should update roles field to in_discord: false for users with archived roles", function () {
      const allUsers = [
        {
          data: () => ({ roles: { archived: true }, discordId: "123" }),
          ref: { update: sinon.spy() },
        },
      ];
      const discordMembers = [];

      usersUtils.mapDiscordMembersDataAndSyncRole(allUsers, discordMembers);

      sinon.assert.calledWithExactly(allUsers[0].ref.update, {
        roles: { archived: true, in_discord: false },
      });
    });
  });
});
