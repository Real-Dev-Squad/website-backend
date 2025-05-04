import { expect } from "chai";
import sinon from "sinon";

import authenticateProfile from "../../../middlewares/authenticateProfile.js";

describe("authenticateProfile Middleware", function () {
  let req, res, next, authenticateStub, auth;

  beforeEach(function () {
    authenticateStub = sinon.spy();
    auth = authenticateProfile(authenticateStub);

    req = {
      query: {},
    };
    res = {
      boom: {
        unauthorized: sinon.spy(),
        forbidden: sinon.spy(),
      },
    };
    next = sinon.spy();
  });

  it("should call authenticate when profile query is true", async function () {
    req.query.profile = "true";
    await auth(req, res, next);

    expect(authenticateStub.withArgs(req, res, next).calledOnce).to.equal(true);
    expect(next.calledOnce).to.equal(false);
  });

  it("should call next when profile query is not true", async function () {
    req.query.profile = "false";

    await auth(req, res, next);

    expect(authenticateStub.calledOnce).to.equal(false);
    expect(next.calledOnce).to.equal(true);
  });

  it("should call next when profile query is missing", async function () {
    await auth(req, res, next);

    expect(authenticateStub.calledOnce).to.equal(false);
    expect(next.calledOnce).to.equal(true);
  });
});
