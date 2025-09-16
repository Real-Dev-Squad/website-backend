import { expect } from "chai";
import { generateAuthTokenForCloudflare } from "../../../utils/discord-actions.js";

describe("test generate auth token for cloudflare", function () {
  it("generates auth token", function () {
    const data = generateAuthTokenForCloudflare();
    expect(data).to.include("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9");
  });
});
