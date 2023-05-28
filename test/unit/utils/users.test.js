const chai = require("chai");
const { expect } = chai;

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

  describe("getUsernamesFromPRs", function () {
    it("returns an array of unique usernames from the filtered PRs/Issues response", function () {
      // Mock the allPRs data
      const allPRs = [
        {
          title: "Redesign the discord linking page",
          username: "RitikJaiswal75",
          state: "closed",
          createdAt: "2023-05-19T06:35:41Z",
          updatedAt: "2023-05-28T19:29:08Z",
          repository: "website-my",
          url: "https://github.com/Real-Dev-Squad/website-my/pull/407",
          labels: ["UX", "UI"],
          assignees: ["RitikJaiswal75"],
        },
        {
          title: "Added a link on logo ",
          username: "kushvahasumit",
          state: "closed",
          createdAt: "2023-04-29T18:01:24Z",
          updatedAt: "2023-05-28T17:58:53Z",
          repository: "website-www",
          url: "https://github.com/Real-Dev-Squad/website-www/pull/465",
          labels: [],
          assignees: [],
        },
        {
          title: "nuke: links to crypto site",
          username: "vvaibhavdesai",
          state: "closed",
          createdAt: "2023-05-07T06:18:28Z",
          updatedAt: "2023-05-28T15:37:54Z",
          repository: "website-www",
          url: "https://github.com/Real-Dev-Squad/website-www/pull/473",
          labels: [],
          assignees: [],
        },
        {
          title: "[Ember-Migration] Embroider Setup",
          username: "rohan09-raj",
          state: "closed",
          createdAt: "2023-05-27T15:55:18Z",
          updatedAt: "2023-05-28T07:56:38Z",
          repository: "website-www",
          url: "https://github.com/Real-Dev-Squad/website-www/pull/490",
          labels: ["ember-migration", "config"],
          assignees: ["rohan09-raj"],
        },
        {
          title: "Added task-dependency data model",
          username: "vinit717",
          state: "closed",
          createdAt: "2023-05-24T00:50:02Z",
          updatedAt: "2023-05-28T06:15:22Z",
          repository: "website-data-models",
          url: "https://github.com/Real-Dev-Squad/website-data-models/pull/46",
          labels: ["documentation"],
          assignees: ["vinit717"],
        },
        {
          title: "[Live-Site] create a modal for joining the live session",
          username: "SanketDhabarde",
          state: "closed",
          createdAt: "2023-05-10T10:01:21Z",
          updatedAt: "2023-05-28T05:01:01Z",
          repository: "website-www",
          url: "https://github.com/Real-Dev-Squad/website-www/pull/477",
          labels: ["live-site"],
          assignees: ["SanketDhabarde"],
        },
        {
          title: "Set github actions timeout to 5 mins",
          username: "prakashchoudhary07",
          state: "closed",
          createdAt: "2023-05-26T11:36:07Z",
          updatedAt: "2023-05-27T09:21:38Z",
          repository: "website-backend",
          url: "https://github.com/Real-Dev-Squad/website-backend/pull/1117",
          labels: [],
          assignees: [],
        },
        {
          title: "create a social share image for realdevsquad.com/join",
          username: "Pratiyushkumar",
          state: "closed",
          createdAt: "2023-05-26T15:22:52Z",
          updatedAt: "2023-05-27T08:21:17Z",
          repository: "website-www",
          url: "https://github.com/Real-Dev-Squad/website-www/pull/487",
          labels: [],
          assignees: ["Pratiyushkumar"],
        },
        {
          title: "Sync dev to main",
          username: "RitikJaiswal75",
          state: "closed",
          createdAt: "2023-05-27T06:01:41Z",
          updatedAt: "2023-05-27T07:59:45Z",
          repository: "website-status",
          url: "https://github.com/Real-Dev-Squad/website-status/pull/586",
          labels: [],
          assignees: [],
        },
        {
          title: "Task details page",
          username: "YashJain24-chief",
          state: "closed",
          createdAt: "2022-11-07T14:43:28Z",
          updatedAt: "2023-05-27T07:35:50Z",
          repository: "website-status",
          url: "https://github.com/Real-Dev-Squad/website-status/pull/341",
          labels: ["feature task"],
          assignees: ["kotesh-arya"],
        },
      ];

      // Visit the page or perform any necessary setup

      // Execute the function and capture the result
      const usernames = usersUtils.getUsernamesFromPRs(allPRs);

      // Assert that the returned value is an array
      expect(usernames).to.be.an("array");

      // Assert that the returned array contains the correct usernames
      // Replace the expectedUsernames array with the expected usernames based on your input data
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
});
