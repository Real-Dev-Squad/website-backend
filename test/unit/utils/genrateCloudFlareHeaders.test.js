const { expect } = require("chai");
const { generateCloudFlareHeaders } = require("../../../utils/discord-actions");

describe("generateCloudFlareHeaders", function () {
  it("generates headers with prop Content-Type and Authorization", function () {
    const data = generateCloudFlareHeaders();
    expect(data["Content-Type"]).to.be.eq("application/json");
    expect(data.Authorization).to.include("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9");
  });
  it("generates headers with prop Content-Type and Authorization and X-Audit-Log-Reason when id and userName is passed", function () {
    const data = generateCloudFlareHeaders({ id: "id", username: "userName" });
    expect(data["Content-Type"]).to.be.eq("application/json");
    expect(data.Authorization).to.include("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9");
    expect(data["X-Audit-Log-Reason"]).to.be.eq("Action initiator's username=>userName and id=id");
  });
});
