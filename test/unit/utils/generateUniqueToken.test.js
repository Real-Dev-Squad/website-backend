const { expect } = require("chai");
const { generateUniqueToken } = require("../../../utils/generateUniqueToken");

describe("RDS-session cookie as a unique token", function () {
  it("should generate cookie as token", function () {
    const data = generateUniqueToken();
    expect(data).to.include("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9");
  });
});
