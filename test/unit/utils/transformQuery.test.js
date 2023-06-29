const { expect } = require("chai");
const { transformQuery } = require("../../../utils/tasks");
const { MAPPED_TASK_STATUS } = require("../../../constants/tasks");

describe("transformQuery", function () {
  it("should transform when dev as false and status as undefined string when both are not passed", function () {
    const transformedQuery = transformQuery();
    expect(transformQuery.status).to.equal(undefined);
    expect(transformedQuery.dev).to.equal(false);
  });

  it("should transfrom status to it's mapped value", function () {
    const status = "done";
    const mappedStatus = MAPPED_TASK_STATUS[status.toUpperCase()];

    const transformedQuery = transformQuery(false, status);
    expect(transformedQuery.status).to.equal(mappedStatus);
  });

  it("should transfrom dev when passed as `true` to boolean", function () {
    const transformedQuery = transformQuery("true");
    expect(transformedQuery.dev).to.equal(true);
    expect(typeof transformedQuery.dev).to.equal("boolean");
  });
});
