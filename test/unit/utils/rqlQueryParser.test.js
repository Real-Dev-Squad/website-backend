import { Operators, QueryTypes } from "../../../typeDefinitions/rqlParser";
const { expect } = require("chai");
const { RQLQueryParser } = require("../../../utils/RQLParser");
describe("RQLQueryParser", function () {
  it("should parse filter queries", function () {
    const queryString = "key:value";
    const parser = new RQLQueryParser(queryString);
    const filterQueries = parser.getFilterQueries();
    expect(filterQueries).to.deep.equal({
      key: [{ operator: Operators.INCLUDE, value: "value" }],
    });
  });
  it("should parse multiple filter queries", function () {
    const queryString = "key:value key2:value key:value2";
    const parser = new RQLQueryParser(queryString);
    const filterQueries = parser.getFilterQueries();
    expect(filterQueries).to.deep.equal({
      key: [
        { operator: Operators.INCLUDE, value: "value" },
        { operator: Operators.INCLUDE, value: "value2" },
      ],
      key2: [{ operator: Operators.INCLUDE, value: "value" }],
    });
  });
  it("should parse multiple filter with exclude queries", function () {
    const queryString = "key:value -key2:value -key:value2";
    const parser = new RQLQueryParser(queryString);
    const filterQueries = parser.getFilterQueries();
    expect(filterQueries).to.deep.equal({
      key: [
        { operator: Operators.INCLUDE, value: "value" },
        { operator: Operators.EXCLUDE, value: "value2" },
      ],
      key2: [{ operator: Operators.EXCLUDE, value: "value" }],
    });
  });
  it("should parse sort queries", function () {
    const queryString = "sort:key-desc";
    const parser = new RQLQueryParser(queryString);
    const sortQueries = parser.getSortQueries();
    expect(sortQueries).to.deep.equal({
      key: "desc",
    });
  });
  it("should parse all queries", function () {
    const queryString = "key:value1 -key:value2 key2:value1 sort:key-asc";
    const parser = new RQLQueryParser(queryString);
    const allQueries = parser.getAllQueries();
    expect(allQueries).to.deep.equal([
      { operator: Operators.INCLUDE, value: "value1", type: QueryTypes.FILTER, key: "key" },
      { operator: Operators.EXCLUDE, value: "value2", type: QueryTypes.FILTER, key: "key" },
      { operator: Operators.INCLUDE, value: "value1", type: QueryTypes.FILTER, key: "key2" },
      { value: "asc", operator: Operators.INCLUDE, type: QueryTypes.SORT, key: "key" },
    ]);
  });
  it("should handle empty queries", function () {
    const queryString = "";
    const parser = new RQLQueryParser(queryString);
    const filterQueries = parser.getFilterQueries();
    const sortQueries = parser.getSortQueries();
    const allQueries = parser.getAllQueries();
    expect(filterQueries).to.deep.equal({});
    expect(sortQueries).to.deep.equal({});
    expect(allQueries).to.deep.equal([]);
  });
  it("should handle invalid query param format", function () {
    const queryString = "invalidKey()&value";
    expect(() => new RQLQueryParser(queryString)).to.throw("Invalid query param format");
  });
});
