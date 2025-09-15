import chai from "chai";
const { expect } = chai;
import { verifyAuthToken } from "../../../utils/verifyAuthToken.js";

describe("verifyAuthToken", () => {
  it("should return false when token is invalid", async () => {
    const invalidToken = "invalid-token";

    const isValid = await verifyAuthToken(invalidToken);
    expect(isValid).false;
  });
});
