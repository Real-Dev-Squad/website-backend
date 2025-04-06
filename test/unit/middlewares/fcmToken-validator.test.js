import { expect } from "chai";
import sinon from "sinon";

import { fcmTokenValidator } from "../../../middlewares/validators/fcmToken.js";

describe("Test the fcmToken validator", function () {
  it("Allows the request to pass", async function () {
    const req = {
      body: {
        fcmToken: "some token",
      },
    };
    const res = {};
    const nextSpy = sinon.spy();
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
    const nextSpy = sinon.spy();
    await fcmTokenValidator(req, res, nextSpy);
    expect(nextSpy.callCount).to.be.equal(0);
  });
});
