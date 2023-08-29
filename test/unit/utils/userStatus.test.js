const chai = require("chai");
const { expect } = chai;
const sinon = require("sinon");
const {
  generateNewStatus,
  checkIfUserHasLiveTasks,
  generateOOONickname,
  updateNickname,
} = require("../../../utils/userStatus");
const { userState, discordNicknameLength, month } = require("../../../constants/userStatus");
const userData = require("../../fixtures/user/user")()[0];
const firestore = require("../../../utils/firestore");
const services = require("../../../services/users");
const userModel = firestore.collection("users");
const userStatusUtils = require("../../../utils/userStatus");
const cleanDb = require("../../utils/cleanDb");
const { getStatus } = require("../../fixtures/userStatus/userStatus");
const userStatusModel = firestore.collection("usersStatus");

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

  /* Skipping since test changes will go through before the util changes */
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("updateNickname", function () {
    let fetchStub, userInfo, getUserDiscordIdUsernameStub, generateOOONicknameStub;

    beforeEach(async function () {
      fetchStub = sinon.stub(global, "fetch");
      userInfo = await userModel.add(userData);
      getUserDiscordIdUsernameStub = sinon.stub(services, "getUserDiscordIdUsername");
      generateOOONicknameStub = sinon.stub(userStatusUtils, "generateOOONickname");
    });

    afterEach(async function () {
      fetchStub.restore();
      getUserDiscordIdUsernameStub.restore();
      generateOOONicknameStub.restore();
    });

    it("should call the user status service to update user's discord nickname successfully", async function () {
      const responseObject = { message: ["User nickname changed successfully"] };
      const { id: userId } = userInfo;
      const { username, discordId } = userData;

      getUserDiscordIdUsernameStub.returns(
        Promise.resolve({
          discordId,
          username,
        })
      );

      fetchStub.returns(
        Promise.resolve({
          status: 200,
          ok: true,
          text: () => Promise.resolve(responseObject),
        })
      );

      await updateNickname(userId, {
        from: new Date().getTime(),
        until: new Date().getTime(),
      });

      expect(getUserDiscordIdUsernameStub.calledOnce).to.be.equal(true);
      expect(fetchStub.calledOnce).to.be.equal(true);
    });

    it("should not call the user status service to update user's discord nickname when there's an error while fetching user details", async function () {
      const error = new Error("Unable to find user with id 1234");
      getUserDiscordIdUsernameStub.returns(Promise.reject(error));

      await updateNickname("1234", {
        from: new Date().getTime(),
        until: new Date().getTime(),
      }).catch((err) => expect(err).to.be.equal(error));
      expect(fetchStub.calledOnce).to.be.equal(false);
    });

    it("should throw error when the users status service call to update user's discord nickname fails", async function () {
      const { id: userId } = userInfo;
      const { username, discordId } = userData;

      getUserDiscordIdUsernameStub.returns(
        Promise.resolve({
          discordId,
          username,
        })
      );

      const error = new Error(`Unable to update nickname for user with discord id ${discordId}`);
      fetchStub.returns(Promise.reject(error));

      await updateNickname(userId, {
        from: new Date().getTime(),
        until: new Date().getTime(),
      }).catch((err) => expect(err).to.be.equal(err));

      expect(fetchStub.calledOnce).to.be.equal(true);
      expect(getUserDiscordIdUsernameStub.calledOnce).to.be.equal(true);
    });
  });

  /* Skipping since test changes will go through before the discordService changes */
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("updateUserStatusFields", function () {
    const getUserStatusDocs = async () =>
      await userStatusModel.where("futureStatus.state", "in", ["ACTIVE", "IDLE", "OOO"]).get();

    afterEach(async function () {
      await cleanDb();
    });

    it("Should update current user OOO state to the future state when the current OOO period expires", async function () {
      const summary = {
        oooUsersAltered: 0,
      };
      const { currentOOOExpiredStatus } = getStatus();
      await userStatusModel.add(currentOOOExpiredStatus);
      const doc = await getUserStatusDocs();
      const data = await userStatusUtils.updateUserStatusFields(doc, summary);

      expect(summary.oooUsersAltered).to.be.equal(1);
      expect(data[0].currentStatus.state).to.be.equal(currentOOOExpiredStatus.futureStatus.state);
      expect(data[0].futureStatus).to.be.equal(undefined);
    });

    it("Should not update the current OOO status when the OOO dates have not expired", async function () {
      const summary = {
        oooUsersUnaltered: 0,
      };
      const { currentOOOPeriodStatus } = getStatus();
      await userStatusModel.add(currentOOOPeriodStatus);
      const doc = await getUserStatusDocs();
      const data = await userStatusUtils.updateUserStatusFields(doc, summary);

      expect(summary.oooUsersUnaltered).to.be.equal(1);
      expect(data.length).to.be.equal(0);
    });

    it("Should not update the current status to future OOO status when future OOO dates have expired and OOO future state should be removed", async function () {
      const { futureOOOExpiredStatus } = getStatus();
      const summary = {
        nonOooUsersAltered: 0,
      };
      await userStatusModel.add(futureOOOExpiredStatus);
      const doc = await getUserStatusDocs();
      const data = await userStatusUtils.updateUserStatusFields(doc, summary);

      expect(summary.nonOooUsersAltered).to.be.equal(1);
      expect(data.length).to.be.equal(1);
      expect(data[0].currentStatus.state).to.be.equal(futureOOOExpiredStatus.currentStatus.state);
      expect(data[0].futureStatus).to.be.equal(undefined);
    });

    it("Should update current user state to the future OOO state when the current date falls between OOO start and end dates", async function () {
      const { futureCurrentOOOPeriodStatus } = getStatus();
      const summary = {
        nonOooUsersAltered: 0,
      };
      await userStatusModel.add(futureCurrentOOOPeriodStatus);
      const doc = await getUserStatusDocs();
      const data = await userStatusUtils.updateUserStatusFields(doc, summary);

      expect(summary.nonOooUsersAltered).to.be.equal(1);
      expect(data[0].currentStatus.state).to.be.equal(futureCurrentOOOPeriodStatus.futureStatus.state);
      expect(data[0].futureStatus.state).to.be.equal(futureCurrentOOOPeriodStatus.currentStatus.state);
    });

    it("Should not update the future user OOO status when the OOO period has not started", async function () {
      const { futureOOOPeriodStatus } = getStatus();
      const summary = {
        nonOooUsersUnaltered: 0,
      };
      await userStatusModel.add(futureOOOPeriodStatus);
      const doc = await getUserStatusDocs();
      const data = await userStatusUtils.updateUserStatusFields(doc, summary);

      expect(summary.nonOooUsersUnaltered).to.be.equal(1);
      expect(data.length).to.be.equal(0);
    });
  });
});
