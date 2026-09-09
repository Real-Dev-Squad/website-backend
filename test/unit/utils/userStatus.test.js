const { expect } = require("chai");
const {
  generateNewStatus,
  checkIfUserHasLiveTasks,
  convertTimestampsToUTC,
  computeIdleDaysExcludingOOO,
} = require("../../../utils/userStatus");
const { userState } = require("../../../constants/userStatus");
const {
  OutputFixtureForFnConvertTimestampsToUTC,
  inputFixtureForFnConvertTimestampsToUTC,
} = require("../../fixtures/userStatus/userStatus");

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

  describe("convertTimestampsToUTC", function () {
    it("should convert timestamps within the input object to UTC 00:00:00 (start of day) and UTC 23:59:59 (end of day)", function () {
      const result = convertTimestampsToUTC(inputFixtureForFnConvertTimestampsToUTC);
      expect(result).to.deep.equal(OutputFixtureForFnConvertTimestampsToUTC);
    });
  });

  describe("computeIdleDaysExcludingOOO", function () {
    const ONE_DAY_MS = 1000 * 60 * 60 * 24;

    it("should return total idle days when no OOO period", function () {
      const windowStart = Date.now() - 10 * ONE_DAY_MS;
      const now = Date.now();
      const days = computeIdleDaysExcludingOOO(windowStart, null, now);
      expect(days).to.equal(10);
    });

    it("should exclude OOO periods from idle days", function () {
      const now = Date.now();
      const windowStart = now - 15 * ONE_DAY_MS;
      const oooPeriods = [{ from: now - 10 * ONE_DAY_MS, until: now - 5 * ONE_DAY_MS }];
      const days = computeIdleDaysExcludingOOO(windowStart, null, now, oooPeriods);
      expect(days).to.equal(10);
    });

    it("should fall back to currentStatusFrom when idleFrom is missing", function () {
      const currentStatusFrom = Date.now() - 8 * ONE_DAY_MS;
      const now = Date.now();
      const days = computeIdleDaysExcludingOOO(null, currentStatusFrom, now);
      expect(days).to.equal(8);
    });

    it("should return 0 when window has no span", function () {
      const now = Date.now();
      const days = computeIdleDaysExcludingOOO(now, null, now);
      expect(days).to.equal(0);
    });

    it("should return 0 when window start is in the future (edge case)", function () {
      const now = Date.now();
      const futureStart = now + 5 * ONE_DAY_MS;
      const days = computeIdleDaysExcludingOOO(futureStart, null, now);
      expect(days).to.equal(0);
    });

    it("should subtract multiple OOO periods", function () {
      const now = Date.now();
      const windowStart = now - 20 * ONE_DAY_MS;
      const oooPeriods = [
        { from: now - 18 * ONE_DAY_MS, until: now - 16 * ONE_DAY_MS }, // 2 days
        { from: now - 10 * ONE_DAY_MS, until: now - 7 * ONE_DAY_MS }, // 3 days
      ];
      const days = computeIdleDaysExcludingOOO(windowStart, null, now, oooPeriods);
      expect(days).to.equal(15);
    });

    it("should handle overlapping OOO periods without double subtracting", function () {
      const now = Date.now();
      const windowStart = now - 20 * ONE_DAY_MS;
      const oooPeriods = [
        { from: now - 12 * ONE_DAY_MS, until: now - 8 * ONE_DAY_MS },
        { from: now - 10 * ONE_DAY_MS, until: now - 6 * ONE_DAY_MS },
      ];
      const days = computeIdleDaysExcludingOOO(windowStart, null, now, oooPeriods);
      expect(days).to.equal(12);
    });

    it("should handle OOO period partially outside window", function () {
      const now = Date.now();
      const windowStart = now - 10 * ONE_DAY_MS;
      const oooPeriods = [{ from: now - 15 * ONE_DAY_MS, until: now - 7 * ONE_DAY_MS }];
      const days = computeIdleDaysExcludingOOO(windowStart, null, now, oooPeriods);
      expect(days).to.equal(7);
    });

    it("should return full idle days when OOO period is outside window", function () {
      const now = Date.now();
      const windowStart = now - 10 * ONE_DAY_MS;
      const oooPeriods = [{ from: now - 20 * ONE_DAY_MS, until: now - 15 * ONE_DAY_MS }];
      const days = computeIdleDaysExcludingOOO(windowStart, null, now, oooPeriods);
      expect(days).to.equal(10);
    });
  });
});
