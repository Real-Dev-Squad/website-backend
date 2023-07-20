const chai = require("chai");
const { expect } = chai;

const usersUtils = require("../../../utils/users");
const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const { filteredPRs } = require("../../fixtures/pullrequests/pullrequests");
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

  describe("getUsernamesFromPRs", function () {
    it("returns an array of unique usernames from the filtered PRs/Issues response", function () {
      // Mock the allPRs data
      const allPRs = filteredPRs;

      // Execute the function and store the result
      const usernames = usersUtils.getUsernamesFromPRs(allPRs);

      // Assert that the returned value is an array
      expect(usernames).to.be.an("array");

      // Assert that the returned array contains the correct usernames
      const expectedUsernames = [
        "RitikJaiswal75",
        "kushvahasumit",
        "vvaibhavdesai",
        "rohan09-raj",
        "vinit717",
        "SanketDhabarde",
        "prakashchoudhary07",
        "Pratiyushkumar",
        "YashJain24-chief",
      ];
      expect(usernames).to.have.members(expectedUsernames);
    });
  });

  describe("getRoleToUpdate", function () {
    it("should return updateRole as false when the role already exists in userData", async function () {
      const userData = {
        roles: {
          member: true,
        },
      };

      const newRoles = {
        member: true,
      };

      const result = await usersUtils.getRoleToUpdate(userData, newRoles);

      expect(result).to.deep.equal({ updateRole: false });
    });
  });

  it("should return updateRole as true and new user roles when the role doesn't exist in userData", async function () {
    const userData = {
      roles: {
        member: true,
      },
    };
    const newRoles = {
      member: false,
    };

    const result = await usersUtils.getRoleToUpdate(userData, newRoles);

    expect(result).to.deep.equal({
      updateRole: true,
      newUserRoles: {
        roles: {
          member: false,
        },
      },
    });
  });
});
