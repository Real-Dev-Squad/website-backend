import { expect } from "chai";
import sinon from "sinon";

import { validateUserStatus } from "../../../middlewares/validators/userStatus.js";

describe("Validation Tests for Cancel OOO", function () {
  let req;
  let res;
  let nextSpy;

  beforeEach(function () {
    res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    nextSpy = sinon.spy();
  });

  it("should validate for a valid request", async function () {
    req = {
      body: {
        cancelOoo: true,
      },
    };
    await validateUserStatus(req, res, nextSpy);
    expect(nextSpy.calledOnce).to.be.equal(true);
  });

  it("should not validate for an invalid request", async function () {
    const req = {
      body: {
        cancelOoo: "not a boolean",
      },
    };
    try {
      await validateUserStatus(req, res, nextSpy);
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(nextSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    }
  });
});
