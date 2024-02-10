const Sinon = require("sinon");
const {
  validateAuthStatus,
  storeUserDeviceInfo,
  validateFetchingUserDocument,
} = require("../../../middlewares/validators/qrCodeAuth");
const { expect } = require("chai");
const { userDeviceInfoDataArray } = require("../../fixtures/qrCodeAuth/qrCodeAuth");
describe("qrCodeAuth", function () {
  describe("test post call validator", function () {
    it("Allows request to pass on valid params", async function () {
      const req = {
        body: {
          ...userDeviceInfoDataArray[0],
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
          ...userDeviceInfoDataArray[0],
          user_id: 12,
        },
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

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

  describe("test get call validator", function () {
    it("Allows request to pass on valid params", async function () {
      const req = {
        query: {
          device_id: "DEVICE_ID",
        },
      };

      const res = {};

      const nextSpy = Sinon.spy();
      await validateFetchingUserDocument(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(1);
    });

    it("Does not allow request to pass on invalid params", async function () {
      const req = {
        query: {
          user_id: "ID",
          device_type: "DEVICE_TYPE",
        },
      };

      const res = {
        boom: {
          badRequest: () => {},
        },
      };

      const nextSpy = Sinon.spy();
      await validateFetchingUserDocument(req, res, nextSpy);
      expect(nextSpy.callCount).to.be.equal(0);
    });
  });
});
