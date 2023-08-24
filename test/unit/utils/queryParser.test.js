const { expect } = require("chai");
const { parseQueryParams } = require("../../../utils/queryParser");

describe("parseQueryParams", function () {
  it("parses query parameters correctly", function () {
    const queryString = "?q=status:APPROVED+DENIED,assignee:user1";
    const parsedParams = parseQueryParams(queryString);

    expect(parsedParams).to.deep.equal({
      status: ["APPROVED", "DENIED"],
      assignee: "user1",
    });
  });

  it("handles empty or malformed query parameters", function () {
    const queryString = "?q=;()";
    const parsedParams = parseQueryParams(queryString);

    expect(parsedParams).to.deep.equal({});
  });

  it('handles multiple values for non-"q" parameters', function () {
    const queryString = "?status=APPROVED&status=DENIED&assignee=user1";
    const parsedParams = parseQueryParams(queryString);

    expect(parsedParams).to.deep.equal({
      status: ["APPROVED", "DENIED"],
      assignee: "user1",
    });
  });
});
