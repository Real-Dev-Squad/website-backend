import { expect } from "chai";
import { transformQuery } from "../../../utils/tasks.js";
import { MAPPED_TASK_STATUS, TASK_STATUS } from "../../../constants/tasks.js";

describe("transformQuery", function () {
  it("should transfrom status to it's mapped value", function () {
    const status = "done";
    const mappedStatus = MAPPED_TASK_STATUS[status.toUpperCase()];

    const transformedQuery = transformQuery(status);
    expect(transformedQuery.status).to.equal(mappedStatus);
  });

  it("should transfrom and parse size to integer when passed as param", function () {
    const transformedQuery = transformQuery(TASK_STATUS.ASSIGNED, "5");
    expect(transformedQuery.size).to.be.equal(5);
    expect(typeof transformedQuery.size).to.equal("number");
  });

  it("should transfrom and parse page to integer when passed as param", function () {
    const transformedQuery = transformQuery(TASK_STATUS.ASSIGNED, 5, "1");
    expect(transformedQuery.page).to.be.equal(1);
    expect(typeof transformedQuery.page).to.equal("number");
  });

  it("should transfrom and parse assignee to lowercase when passed as param", function () {
    const transformedQuery = transformQuery(TASK_STATUS.ASSIGNED, 5, 1, "Test");
    expect(transformedQuery.assignee).to.be.equal("test");
    expect(typeof transformedQuery.assignee).to.equal("string");
  });
});
