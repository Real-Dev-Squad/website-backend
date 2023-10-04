const chai = require("chai");
const { expect } = chai;
const {
  generateNewStatus,
  checkIfUserHasLiveTasks,
  convertTimestampToUTCStartOrEndOfDay,
  convertTimestampsToUTC,
} = require("../../../utils/userStatus");
const { userState } = require("../../../constants/userStatus");

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

  describe("convertTimestampToUTCStartOrEndOfDay", function () {
    it("should convert a timestamp to UTC 00:00:00 when isEndOfDay is false", function () {
      const timestamp = 1696439365987; // Wed Oct 04 2023 17:09:25 UTC
      const isEndOfDay = false;
      const result = convertTimestampToUTCStartOrEndOfDay(timestamp, isEndOfDay);

      // Expected result: 1696377600000 Wed Oct 04 2023 00:00:00 UTC
      expect(result).to.equal(1696377600000);
    });

    it("should convert a timestamp to UTC 23:59:59.999 when isEndOfDay is true", function () {
      const timestamp = 1696439365987; // Wed Oct 04 2023 17:09:25 UTC
      const isEndOfDay = true;
      const result = convertTimestampToUTCStartOrEndOfDay(timestamp, isEndOfDay);

      // Expected result: 1696463999999 Wed Oct 04 2023 23:59:59 UTC
      expect(result).to.equal(1696463999999);
    });
  });

  describe("convertTimestampsToUTC", function () {
    it("should convert timestamps within the input object to UTC 00:00:00 (start of day) and UTC 23:59:59 (end of day)", function () {
      const inputObject = {
        currentStatus: {
          from: 1696439365987, // Wed Oct 04 2023 17:09:25 UTC
          until: 1697124600000, // Thu Oct 12, 2023, 15:30:00
        },
        futureStatus: {
          from: 1696439365987, // Wed Oct 04 2023 17:09:25 UTC
          until: "", // An empty string
        },
      };

      // Expected output object with timestamps converted to UTC
      const expectedOutput = {
        currentStatus: {
          from: 1696377600000, // October 4, 2023, 00:00:00 UTC
          until: 1697155199999, // Thu Oct 12, 2023, 23:59:59 UTC
        },
        futureStatus: {
          from: 1696377600000, // October 4, 2023, 00:00:00 UTC
          until: "", // No conversion for an empty string
        },
      };

      const result = convertTimestampsToUTC(inputObject);
      expect(result).to.deep.equal(expectedOutput);
    });
  });
});
