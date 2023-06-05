const chai = require("chai");
const { getDateTimeRangeForPRs, getQualifiers } = require("../../../utils/helper");
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
});
