const Sinon = require("sinon");
const { validateAuthStatus } = require("../../../middlewares/validators/qrCodeAuth");
const { expect } = require("chai");

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
