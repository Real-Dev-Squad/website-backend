const { expect } = require("chai");
import flattenObject from "../../../utils/flattenObject";

describe("flattenObject", function () {
  it("flattenObject should flatten nested objects", () => {
    const input = {
      key1: "value1",
      key2: {
        key3: "value2",
        key4: {
          key5: "value3",
        },
      },
    };
    const expectedOutput = {
      key1: "value1",
      "key2.key3": "value2",
      "key2.key4.key5": "value3",
    };
    const result = flattenObject(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it("flattenObject should handle empty input", () => {
    const input = {};
    const expectedOutput = {};
    const result = flattenObject(input);
    expect(result).to.deep.equal(expectedOutput);
  });

  it("flattenObject should handle arrays", () => {
    const input = {
      key1: "value1",
      key2: ["value2", "value3"],
    };
    const expectedOutput = {
      key1: "value1",
      key2: ["value2", "value3"],
    };
    const result = flattenObject(input);
    expect(result).to.deep.equal(expectedOutput);
  });
});
