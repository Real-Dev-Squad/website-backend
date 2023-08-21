const chai = require("chai");
const { expect } = chai;
const { generateNewStatus, checkIfUserHasLiveTasks, generateOOONickname } = require("../../../utils/userStatus");
const { userState, discordNicknameLength, month } = require("../../../constants/userStatus");
const userData = require("../../fixtures/user/user")()[0];

describe("User Status Functions", function () {
  describe("generateNewStatus", function () {
    it('should return a new status object with state "ACTIVE" when isActive is true', function () {
      const isActive = true;
      const result = generateNewStatus(isActive);
      expect(result.currentStatus.state).to.equal(userState.ACTIVE);
    });

    it('should return a new status object with state "IDLE" when isActive is false', function () {
      const isActive = false;
      const result = generateNewStatus(isActive);
      expect(result.currentStatus.state).to.equal(userState.IDLE);
    });

    it("should set the from and updatedAt properties to the current timestamp", function () {
      const isActive = true;
      const currentTimeStamp = new Date().getTime();
      const result = generateNewStatus(isActive);
      expect(result.currentStatus.from).to.equal(currentTimeStamp);
      expect(result.currentStatus.updatedAt).to.equal(currentTimeStamp);
    });

    it("should set the message and until properties to empty strings", function () {
      const isActive = false;
      const result = generateNewStatus(isActive);
      expect(result.currentStatus.message).to.equal("");
      expect(result.currentStatus.until).to.equal("");
    });
  });

  describe("checkIfUserHasLiveTasks", function () {
    it("should return true if the user has active tasks", async function () {
      const userId = "user123";
      const mockSnapshot = {
        size: 2,
      };
      const mockGet = () => Promise.resolve(mockSnapshot);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const tasksModel = {
        where: mockWhere,
      };

      const result = await checkIfUserHasLiveTasks(userId, tasksModel);
      expect(result).to.equal(true);
    });

    it("should return false if the user does not have any active tasks", async function () {
      const userId = "user123";
      const mockSnapshot = {
        size: 0,
      };
      const mockGet = () => Promise.resolve(mockSnapshot);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const tasksModel = {
        where: mockWhere,
      };

      const result = await checkIfUserHasLiveTasks(userId, tasksModel);
      expect(result).to.equal(false);
    });

    it("should throw an error if an error occurs during the query", async function () {
      const userId = "user123";
      const errorMessage = "Query error";
      const mockError = new Error(errorMessage);
      const mockGet = () => Promise.reject(mockError);
      const mockWhere = () => ({
        where: mockWhere,
        get: mockGet,
      });
      const tasksModel = {
        where: mockWhere,
      };

      try {
        await checkIfUserHasLiveTasks(userId, tasksModel);
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal(errorMessage);
      }
    });
  });

  /* Skipping since test changes will go through before the util changes */
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("generateOOONickname", function () {
    it("should return nickname of the user when username, from and status is passed", async function () {
      const { username } = userData;
      const from = new Date();
      const until = new Date();
      const nickname = generateOOONickname(username, from.getTime(), until.getTime());

      const fromDate = from.getDate();
      const untilDate = until.getDate();
      const fromMonth = month[from.getMonth()];
      const untilMonth = month[until.getMonth()];

      const oooMessage = `(OOO ${fromMonth} ${fromDate} - ${untilMonth} ${untilDate})`;
      const oooMessageLen = oooMessage.length;
      const usernameLen = discordNicknameLength - oooMessageLen - 1;
      expect(nickname).to.be.equal(`${username.substring(0, usernameLen)} ${oooMessage}`);
    });

    it("should return nickname of the user with from and until date when username, from and until OOO dates are passed", async function () {
      const { username } = userData;
      const from = new Date();
      const until = new Date();
      const status = {
        from: from.getTime(),
        until: from.getTime(),
      };
      const nickname = generateOOONickname(username, status.from, status.until);

      const fromDate = from.getDate();
      const untilDate = until.getDate();
      const fromMonth = month[from.getMonth()];
      const untilMonth = month[until.getMonth()];

      const oooMessage = `(OOO ${fromMonth} ${fromDate} - ${untilMonth} ${untilDate})`;
      const oooMessageLen = oooMessage.length;
      const usernameLen = discordNicknameLength - oooMessageLen - 1;
      expect(nickname).to.be.equal(`${username.substring(0, usernameLen)} ${oooMessage}`);
    });

    it("should return nickname of the user only with until date when username and OOO until are passed, but not OOO from date", async function () {
      const { username } = userData;
      const until = new Date();
      const status = {
        until: until.getTime(),
      };
      const nickname = generateOOONickname(username, status.from, status.until);

      const untilDate = until.getDate();
      const untilMonth = month[until.getMonth()];

      const oooMessage = `(OOO ${untilMonth} ${untilDate})`;
      const oooMessageLen = oooMessage.length;
      const usernameLen = discordNicknameLength - oooMessageLen - 1;
      expect(nickname).to.be.equal(`${username.substring(0, usernameLen)} ${oooMessage}`);
    });
  });
});
