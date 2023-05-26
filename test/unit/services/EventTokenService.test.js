const { expect } = require("chai");
const jwt = require("jsonwebtoken");
const { EventTokenService } = require("../../../services/EventTokenService");

describe("EventTokenService", function () {
  describe("#getManagementToken", function () {
    it("should return a valid management token", function () {
      const service = new EventTokenService();
      const token = service.getManagementToken();
      const decodedToken = jwt.decode(token);
      expect(decodedToken).to.have.property("access_key");
      expect(decodedToken).to.have.property("type", "management");
      expect(decodedToken).to.have.property("version", 2);
      expect(decodedToken).to.have.property("iat");
      expect(decodedToken).to.have.property("nbf");
    });

    it("should return a new management token if forced", function () {
      const service = new EventTokenService();
      const token1 = service.getManagementToken();
      const token2 = service.getManagementToken(true);
      expect(token1).to.not.equal(token2);
    });

    it("should return the same management token if not expired", function () {
      const service = new EventTokenService();
      const token1 = service.getManagementToken();
      const token2 = service.getManagementToken();
      expect(token1).to.equal(token2);
    });
  });

  describe("#getAuthToken", function () {
    it("should return a valid auth token", function () {
      const service = new EventTokenService();
      const roomId = "123";
      const userId = "456";
      const role = "participant";
      const token = service.getAuthToken({ roomId, userId, role });
      const decodedToken = jwt.decode(token);
      expect(decodedToken).to.have.property("access_key");
      expect(decodedToken).to.have.property("room_id", roomId);
      expect(decodedToken).to.have.property("user_id", userId);
      expect(decodedToken).to.have.property("role", role);
      expect(decodedToken).to.have.property("type", "app");
      expect(decodedToken).to.have.property("version", 2);
      expect(decodedToken).to.have.property("iat");
      expect(decodedToken).to.have.property("nbf");
    });
  });
});
