const chai = require("chai");
const { getRandomIndex } = require("../../../utils/helper");
const { expect } = chai;

describe("helpers", function () {
  describe("getRandom Index from function", function () {
    it("should return a random number between 0 and 10 excluding 10 if no index is passed", function () {
      const result = getRandomIndex();
      expect(result).to.be.at.least(0);
      expect(result).to.be.below(10);
    });

    it("expect a number between 0 and passed number", function () {
      const delimiter = 100;
      const result = getRandomIndex(delimiter);
      expect(result).to.be.at.least(0);
      expect(result).to.be.below(delimiter);
    });
  });
});
