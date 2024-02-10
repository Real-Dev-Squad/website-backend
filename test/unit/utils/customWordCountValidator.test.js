const { expect } = require("chai");
const { customWordCountValidator } = require("./../../../utils/customWordCountValidator");

describe("customWordCountValidator", function () {
  it("should return an error if the word count is less than the desired count", function () {
    const value = "This is a test string with more than 100 words.";
    const helpers = {
      error: () => "Word count validation failed.",
    };
    const wordCount = 100;

    const result = customWordCountValidator(value, helpers, wordCount);
    expect(result).to.equal("Word count validation failed.");
  });

  it("should return the original value if the word count meets the desired count", function () {
    const value = "This string has more than 100 words. " + "This ".repeat(96) + "word.";
    const helpers = {
      error: () => "Word count validation failed.",
    };
    const wordCount = 100;

    const result = customWordCountValidator(value, helpers, wordCount);
    expect(result).to.equal(value);
  });
});
