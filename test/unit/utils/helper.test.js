const chai = require("chai");
const {
  getDateTimeRangeForPRs,
  getQualifiers,
  getPaginatedLink,
  findSubscribedGroupIds,
} = require("../../../utils/helper");
const { TASK_STATUS, TASK_SIZE } = require("../../../constants/tasks");
const { expect } = chai;

describe("helper", function () {
  describe("getDateTimeRangeForPRs", function () {
    it("should return date range string if both start and end dates are provided", function () {
      const startDate = "2023-01-01";
      const endDate = "2023-01-31";
      const result = getDateTimeRangeForPRs(startDate, endDate);
      expect(result).to.equal("2023-01-01..2023-01-31");
    });

    it('should return ">=startDate" string if only start date is provided', function () {
      const startDate = "2023-01-01";
      const result = getDateTimeRangeForPRs(startDate);
      expect(result).to.equal(">=2023-01-01");
    });

    it('should return "<=endDate" string if only end date is provided', function () {
      const endDate = "2023-01-31";
      const result = getDateTimeRangeForPRs(undefined, endDate);
      expect(result).to.equal("<=2023-01-31");
    });

    it("should return empty string if neither start nor end date is provided", function () {
      const result = getDateTimeRangeForPRs();
      expect(result).to.equal("");
    });
  });

  describe("getQualifiers", function () {
    it("should return an object containing the qualifiers with value", function () {
      const query = "filterBy:OPEN_PRS sortBy:RECENT_FIRST startDate:2023-01-01 endDate:2023-03-01";
      const result = getQualifiers(query);
      expect(result).to.deep.equal({
        filterBy: "OPEN_PRS",
        sortBy: "RECENT_FIRST",
        startDate: "2023-01-01",
        endDate: "2023-03-01",
      });
    });
  });

  describe("getPaginatedLink", function () {
    it("should return a string with paginated link", function () {
      const status = TASK_STATUS.ASSIGNED;
      const dev = true;
      const query = {
        dev,
        status,
      };
      const endpoint = "/tasks";
      const cursorKey = "next";
      const docId = "UH2XHmOJKCrgherGODjG";
      const result = getPaginatedLink({
        query,
        endpoint: "/tasks",
        cursorKey,
        docId,
      });
      expect(result).to.contain(endpoint);
      expect(result).to.contain(`status=${status}`);
      expect(result).to.contain(`dev=${dev}`);
      expect(result).to.contain(`${cursorKey}=${docId}`);
      expect(result).to.contain(`size=${TASK_SIZE}`);
    });

    it("should return a string and the return value should not contain cursor key present in the query", function () {
      const status = TASK_STATUS.ASSIGNED;
      const dev = true;
      const nextId = "UH2XHmOJKCrgherGODjG";

      const query = {
        dev,
        status,
        next: nextId,
      };
      const endpoint = "/tasks";
      const cursorKey = "prev";
      const docId = "SCH3owHWcOQX0jFLurAP";
      const result = getPaginatedLink({
        query,
        endpoint: "/tasks",
        cursorKey,
        docId,
      });
      expect(result).to.contain(endpoint);
      expect(result).to.contain(`status=${status}`);
      expect(result).to.contain(`dev=${dev}`);
      expect(result).to.contain(`${cursorKey}=${docId}`);
      expect(result).to.not.contain(`next=${nextId}`);
    });
  });

  describe("findSubscribedGroupIds", function () {
    it("should return set of member groupIds", function () {
      const memberGroupIds = findSubscribedGroupIds("1234", [
        { userid: "1234", roleid: "1" },
        { userid: "12345", roleid: "3" },
      ]);
      expect(memberGroupIds).to.deep.equal(new Set(["1"]));
    });
  });
});
