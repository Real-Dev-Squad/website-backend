import chai from "chai";
import sinon from "sinon";
const { expect } = chai;
import conditionalMiddleware from "../../../middlewares/conditionalMiddleware.js";
import * as authService from "../../../services/authService.js";
import addUser from "../../utils/addUser.js";

describe("conditional Middleware", function () {
  let req, res, next, validatorStub, middleware;

  beforeEach(async function () {
    const userId = await addUser();
    validatorStub = sinon.spy();
    middleware = conditionalMiddleware(validatorStub);

    req = {
      params: { userId },
      query: {},
      userData: { id: userId },
    };
    res = {
      boom: {
        unauthorized: sinon.spy(),
        forbidden: sinon.spy(),
        badRequest: sinon.spy(),
      },
    };
    next = sinon.spy();
  });

  it("should call the validator when profile query is true", async function () {
    req.query.profile = "true";
    await middleware(req, res, next);

    expect(validatorStub.calledOnceWith(req, res, next)).to.equal(true);
    expect(next.calledOnce).to.equal(false);
  });

  it("should call next when profile query is not true", async function () {
    req.query.profile = "false";

    await middleware(req, res, next);

    expect(validatorStub.called).to.equal(false);
    expect(next.calledOnce).to.equal(true);
  });

  it("should call next when profile query is missing", async function () {
    await middleware(req, res, next);

    expect(validatorStub.called).to.equal(false);
    expect(next.calledOnce).to.equal(true);
  });

  it("should call next when userData.id does not match params.userId", async function () {
    req.params.userId = "anotherUserId";
    req.query.profile = "true";

    await middleware(req, res, next);

    expect(validatorStub.called).to.equal(false);
    expect(next.calledOnce).to.equal(true);
  });
});
