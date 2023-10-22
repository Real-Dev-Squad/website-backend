const { expect } = require("chai");
const { generateAuthToken } = require("../../../services/authService");

describe("RDS-session cookie as a unique token", function () {
  it("should generate cookie as token", function () {
    const userId = "HluRbHU6I7YLqSFBa7qC";
    const data = generateAuthToken({ userId });
    expect(data).to.include("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9");
  });
});
