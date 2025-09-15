import * as chai from "chai";
import chaiHttp from "chai-http";
import { expect } from "chai";
import authService from "../../../services/authService.js";

chai.use(chaiHttp);

describe("authService", function () {
  it("should validate the generated JWT", function (done) {
    const payload = { userId: 1 };
    const jwt = authService.generateAuthToken(payload);
    const decodedValue = authService.verifyAuthToken(jwt);

    expect(decodedValue).to.have.all.keys("userId", "iat", "exp");
    expect(decodedValue.userId).to.equal(payload.userId);

    return done();
  });

  it("should decode the generated JWT", function (done) {
    const payload = { userId: 1 };
    const jwt = authService.generateAuthToken(payload);
    const decodedValue = authService.decodeAuthToken(jwt);

    expect(decodedValue).to.have.all.keys("userId", "iat", "exp");
    expect(decodedValue.userId).to.equal(payload.userId);

    return done();
  });

  describe("generateImpersonationAuthToken", function () {
    const payload = { userId: "devUser123", impersonatedUserId: "testUser456" };

    it("should generate a valid JWT with correct payload", function (done) {
      const jwtToken = authService.generateImpersonationAuthToken(payload);
      const decoded = authService.verifyAuthToken(jwtToken); // Assuming verifyAuthToken uses the same public key

      expect(decoded).to.have.all.keys("userId", "impersonatedUserId", "iat", "exp");
      expect(decoded.userId).to.equal(payload.userId);
      expect(decoded.impersonatedUserId).to.equal(payload.impersonatedUserId);

      return done();
    });

    it("should decode the impersonation JWT without verifying", function (done) {
      const jwtToken = authService.generateImpersonationAuthToken(payload);
      const decoded = authService.decodeAuthToken(jwtToken); // No signature verification

      expect(decoded).to.have.all.keys("userId", "impersonatedUserId", "iat", "exp");
      expect(decoded.userId).to.equal(payload.userId);
      expect(decoded.impersonatedUserId).to.equal(payload.impersonatedUserId);

      return done();
    });
  });
});
