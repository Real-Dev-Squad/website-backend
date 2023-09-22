const chai = require("chai");
const { expect } = chai;

const usersUtils = require("../../../utils/users");
const cleanDb = require("../../utils/cleanDb");
const addUser = require("../../utils/addUser");
const { filteredPRs } = require("../../fixtures/pullrequests/pullrequests");
const { months, discordNicknameLength } = require("../../../constants/users");
const userData = require("../../fixtures/user/user")()[0];
const sinon = require("sinon");
const firestore = require("../../../utils/firestore");
const userModel = firestore.collection("users");
const dataAccessLayer = require("../../../services/dataAccessLayer");

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

  describe("parseSearchQuery", function () {
    it("should return an object with filterBy and days properties", function () {
      const queryString = "filterBy:UNMERGED_PRS days:30";
      const result = usersUtils.parseSearchQuery(queryString);
      expect(result).to.deep.equal({ filterBy: "unmerged_prs", days: 30 });
    });
  });

  describe("generateOOONickname", function () {
    it("should return nickname of the user with from and until date when username, from and until OOO dates are passed", async function () {
      const { username } = userData;
      const from = new Date();
      const until = new Date();
      const nickname = usersUtils.generateOOONickname(username, from.getTime(), until.getTime());

      const fromDate = from.getDate();
      const untilDate = until.getDate();
      const fromMonth = months[from.getMonth()];
      const untilMonth = months[until.getMonth()];

      const oooMessage = `(OOO ${fromMonth} ${fromDate} - ${untilMonth} ${untilDate})`;
      const oooMessageLen = oooMessage.length;
      const usernameLen = discordNicknameLength - oooMessageLen - 1;
      expect(nickname).to.be.equal(`${username.substring(0, usernameLen)} ${oooMessage}`);
    });

    it("should return username of the user as nickname when only username is passed and not from and until date ", async function () {
      const { username } = userData;
      const nickname = usersUtils.generateOOONickname(username);

      expect(nickname).to.be.equal(username);
    });
  });

  describe("updateNickname", function () {
    let fetchStub, userInfo;

    beforeEach(async function () {
      fetchStub = sinon.stub(global, "fetch");
      userInfo = await userModel.add(userData);
    });

    afterEach(async function () {
      fetchStub.restore();
    });

    it("should call the user status service to update user's discord nickname successfully", async function () {
      const { id: userId } = userInfo;
      const response = "User nickname changed successfully";
      fetchStub.returns(
        Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve(response),
        })
      );

      const status = {
        from: new Date().getTime(),
        until: new Date().getTime(),
      };
      const nickname = usersUtils.generateOOONickname(userData.username, status.from, status.until);

      const responseObj = {
        userEffected: nickname,
        message: response,
      };

      const res = await usersUtils.updateNickname(userId, status);

      expect(fetchStub.calledOnce).to.be.equal(true);
      expect(res).to.be.deep.equal(responseObj);
    });

    it("should not call the user status service to update user's discord nickname when there's an error while fetching user details", async function () {
      const dataAccessLayerRetrieveUsersStub = sinon.stub(dataAccessLayer, "retrieveUsers");
      const error = new Error("Unable to find user with id 1234");
      dataAccessLayerRetrieveUsersStub.rejects(error);

      await usersUtils
        .updateNickname("1234", {
          from: new Date().getTime(),
          until: new Date().getTime(),
        })
        .catch((err) => expect(err).to.be.equal(error));
      expect(fetchStub.calledOnce).to.be.equal(false);
    });

    it("should throw error when the users status service call to update user's discord nickname fails", async function () {
      const { id: userId } = userInfo;
      const discordId = userData.discordId;

      const error = new Error(`Unable to update nickname for user with discord id ${discordId}`);
      fetchStub.rejects(Promise.reject(error));

      await usersUtils
        .updateNickname(userId, {
          from: new Date().getTime(),
          until: new Date().getTime(),
        })
        .catch((err) => expect(err).to.be.equal(err));
    });
  });
});
