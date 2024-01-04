const Sinon = require("sinon");

const { expect } = require("chai");
const { fcmTokenValidator } = require("../../../middlewares/validators/fcmToken");

describe("Test the fcmToken validator", function () {
  it("Allows the request to pass", async function () {
    const req = {
      body: {
        fcmToken: "some token",
      },
    };
    const res = {};
    const nextSpy = Sinon.spy();
    await fcmTokenValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(1);
  });

  it("Stops the request to propogate to next", async function () {
    const req = {
      body: {
        "": "",
      },
    };
    const res = {
      boom: {
        badRequest: () => {},
      },
    };
    const nextSpy = Sinon.spy();
    await fcmTokenValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
