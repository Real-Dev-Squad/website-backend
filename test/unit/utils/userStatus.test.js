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

    afterEach(function () {
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
      expect(generateOOONicknameStub.calledOnce).to.be.equal(true);
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
      expect(generateOOONicknameStub.calledOnce).to.be.equal(false);
    });

    /* Skipping since test changes will go through before the util changes */
    // eslint-disable-next-line mocha/no-skipped-tests
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
      expect(generateOOONicknameStub.calledOnce).to.be.equal(true);
      expect(getUserDiscordIdUsernameStub.calledOnce).to.be.equal(true);
    });
  });

  /* Skipping since test changes will go through before the util changes */
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("updateUserStatusFields", function () {
    it("Should update current user OOO state to the future IDLE state when the current date exceeds OOO until", function () {});

    it("Should update current user OOO state to the future ACTIVE state when the current date exceeds OOO until", function () {});

    it("Should not update current user OOO state to the future IDLE state when the current date does not exceed OOO until", function () {});

    it("Should not update current user OOO state to the future ACTIVE state when the current date does not exceed OOO until", function () {});

    // future status is OOO

    it("Should update current user ACTIVE state to the future OOO state when the current date exceeds OOO from but not until timestamp", function () {});

    it("Should update current user IDLE state to the future OOO state when the current date exceeds OOO from but not until timestamp", function () {});

    it("Should remove the future user OOO status when the current date exceeds OOO until timestamp", function () {});

    it("Should not update current user ACTIVE state to the future OOO state when the current date does not exceed OOO from timestamp", function () {});

    it("Should not update current user IDLE state to the future OOO state when the current date does not exceed OOO from timestamp", function () {});
  });

  /* Skipping since test changes will go through before the util changes */
  // eslint-disable-next-line mocha/no-skipped-tests
  describe.skip("updateUsersDiscordNicknameBasedOnStatus", function () {
    it("Should update user's nickname to add OOO dates when the user's updated current status is OOO", function () {});

    it("Should update user's nickname to remove OOO dates when the user's updated current status is ACTIVE from OOO", function () {});

    it("Should update user's nickname to remove OOO dates when the user's updated current status is IDLE from OOO", function () {});

    it("Should not update user's nickname to add OOO date when OOO date exceeds the current date ", function () {});

    // future status is OOO

    it("Should update user's nickname to add OOO end date when the OOO date exceeds the current date, but new state is also OOO", function () {});

    it("Should update user's nickname to add OOO when the updated current status is OOO", function () {});

    it("Should update user's nickname to add OOO when the current date is three days away from OOO start date", function () {});

    it("Should not update user's nickname when the current status remains unchanged", function () {});
  });
});
