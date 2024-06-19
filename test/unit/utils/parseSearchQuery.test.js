const { expect } = require("chai");
const { parseSearchQuery } = require("../../../utils/tasks");

describe("parseSearchQuery", function () {
  it("should parse a valid query string", function () {
    const queryString = "searchterm:example+assignee:john.doe+status:in_progress";
    const result = parseSearchQuery(queryString);

    expect(result).to.deep.equal({
      searchTerm: "example",
      assignee: "john.doe",
      status: "in_progress",
    });
  });

  it("should handle an empty query string", function () {
    const queryString = "";
    const result = parseSearchQuery(queryString);

    expect(result).to.deep.equal({});
  });

  it("should ignore unknown keys in the query string", function () {
    const queryString = "searchterm:example+assignee:john.doe+category:work";
    const result = parseSearchQuery(queryString);

    expect(result).to.deep.equal({
      searchTerm: "example",
      assignee: "john.doe",
    });
  });

  it("should handle query string with duplicate keys", function () {
    const queryString = "searchterm:example+searchterm:test+assignee:john.doe";
    const result = parseSearchQuery(queryString);

    expect(result).to.deep.equal({
      searchTerm: "test",
      assignee: "john.doe",
    });
  });
});
