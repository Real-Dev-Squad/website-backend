const { expect } = require("chai");
const { transformTasksUsersQuery, checkCompletedOrDoneByFeatureFlag } = require("../../../utils/tasks");
const { RQLQueryParser } = require("../../../utils/RQLParser");
const { tasksUsersStatus, TASK_STATUS } = require("../../../constants/tasks");

describe("Utils | Tasks", function () {
  describe("transformTasksUsersQuery", function () {
    it("should correctly transform given queries", function () {
      const rqlParser = new RQLQueryParser(
        `status:${tasksUsersStatus.MISSED_UPDATES} -weekday:sun -date:231423432 -days-count:4`
      );
      const filterQueries = rqlParser.getFilterQueries();
      const result = transformTasksUsersQuery({ ...filterQueries, size: 40 });
      const { dateGap, status, size, weekdayList, dateList } = result;
      expect(status).to.equal(tasksUsersStatus.MISSED_UPDATES);
      expect(weekdayList).to.deep.equal([0]);
      expect(dateList).to.deep.equal([231423432]);
      expect(dateGap).to.equal(4);
      expect(size).to.equal(40);
    });

    it("should correctly transform multiple queries", function () {
      const rqlParser = new RQLQueryParser(
        `status:${tasksUsersStatus.MISSED_UPDATES} -weekday:sun -weekday:mon -date:231423432 -date:231423433434 -days-count:4`
      );
      const filterQueries = rqlParser.getFilterQueries();
      const result = transformTasksUsersQuery({ ...filterQueries, size: 40 });
      const { dateGap, status, size, weekdayList, dateList } = result;
      expect(status).to.equal(tasksUsersStatus.MISSED_UPDATES);
      expect(weekdayList).to.deep.equal([0, 1]);
      expect(dateList).to.deep.equal([231423432, 231423433434]);
      expect(dateGap).to.deep.equal(4);
      expect(size).to.deep.equal(40);
    });

    it("should return undefined for empty query values", function () {
      const result = transformTasksUsersQuery({});
      const { dateGap, status, size, weekdayList, dateList } = result;
      expect(dateGap).to.equal(undefined);
      expect(status).to.equal(undefined);
      expect(size).to.equal(undefined);
      expect(weekdayList).to.equal(undefined);
      expect(dateList).to.equal(undefined);
    });

    it("should handle null queries gracefully", function () {
      const result = transformTasksUsersQuery(null);
      const { dateGap, status, size, weekdayList, dateList } = result;
      expect(dateGap).to.equal(undefined);
      expect(status).to.equal(undefined);
      expect(size).to.equal(undefined);
      expect(weekdayList).to.equal(undefined);
      expect(dateList).to.equal(undefined);
    });

    it("should handle undefined queries gracefully", function () {
      const result = transformTasksUsersQuery(undefined);
      const { dateGap, status, size, weekdayList, dateList } = result;
      expect(dateGap).to.equal(undefined);
      expect(status).to.equal(undefined);
      expect(size).to.equal(undefined);
      expect(weekdayList).to.equal(undefined);
      expect(dateList).to.equal(undefined);
    });

    it("should ignore unexpected query keys", function () {
      const queries = { unexpectedKey: [{ value: "someValue" }] };
      const result = transformTasksUsersQuery(queries);
      expect(result).to.not.have.property("unexpectedKey");
    });
  });

  describe("checkCompletedOrDoneByFeatureFlag", function () {
    it("should return true if feature flag is turned on and status is DONE or feature flag is not turned off and status is COMPLETED", function () {
      expect(checkCompletedOrDoneByFeatureFlag(TASK_STATUS.COMPLETED, false)).to.equal(true);
      expect(checkCompletedOrDoneByFeatureFlag(TASK_STATUS.DONE, true)).to.equal(true);
    });

    it("should return false if feature flag is turned off and status is DONE or feature flag is turned on and status is COMPLETED", function () {
      expect(checkCompletedOrDoneByFeatureFlag(TASK_STATUS.COMPLETED, true)).to.equal(false);
      expect(checkCompletedOrDoneByFeatureFlag(TASK_STATUS.DONE, false)).to.equal(false);
    });

    it("should return false if status other than completed or done ", function () {
      expect(checkCompletedOrDoneByFeatureFlag(TASK_STATUS.IN_PROGRESS, false)).to.equal(false);
      expect(checkCompletedOrDoneByFeatureFlag(TASK_STATUS.IN_PROGRESS, true)).to.equal(false);
    });
  });
});
