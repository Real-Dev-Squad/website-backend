const Sinon = require("sinon");
const { validateAuthStatus, storeUserDeviceInfo } = require("../../../middlewares/validators/qrCodeAuth");
const { expect } = require("chai");

describe("qrCodeAuth", function () {
  describe("test post call validator", function () {
    it("Allows request to pass on valid params", async function () {
      const req = {
        body: {
          user_id: "TEST_USER_ID",
          device_info: "TEST_DEVICE_INFO",
          device_id: "TEST_DEVICE_ID",
        },
      };

      const res = {};

      const nextSpy = Sinon.spy();
      await storeUserDeviceInfo(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });
    it("It does not allow request to pass on invalid params", async function () {
      const req = {
        body: {
          user_id: 12,
          device_info: "TEST_DEVICE_INFO",
          device_id: "TEST_DEVICE_ID",
        },
      };

      const res = {};

      const nextSpy = Sinon.spy();
      await storeUserDeviceInfo(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
  describe("test auth status validator", function () {
    it("Allows request to pass on valid params", async function () {
      const req = {
        params: {
          authorization_status: "AUTHORIZED",
        },
      };

      const res = {};

      const nextSpy = Sinon.spy();
      await validateAuthStatus(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Does not allow request to pass on invalid params", async function () {
      const req = {
        params: {
          authorization_status: "OK",
        },
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await validateAuthStatus(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
