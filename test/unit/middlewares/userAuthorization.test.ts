import * as sinon from "sinon";
import chai from "chai";
const { expect } = chai;
import { userAuthorization  } from "../../../middlewares/userAuthorization.js";

describe("userAuthorization Middleware", function () {
  let req;
  let res;
  let next;

  beforeEach(function () {
    req = {
      params: {},
      userData: {},
    };
    res = {
      boom: {
        forbidden: sinon.spy((message) => {
          res.status = 403;
          res.message = message;
        }),
      },
    };
    next = sinon.spy();
  });

  it("should call next() if userId matches userData.id", function () {
    req.params.userId = "123";
    req.userData.id = "123";

    userAuthorization(req, res, next);

    expect(next.calledOnce).to.be.true;
    expect(res.boom.forbidden.notCalled).to.be.true;
  });

  it("should call res.boom.forbidden() if userId does not match userData.id", function () {
    req.params.userId = "123";
    req.userData.id = "456";

    userAuthorization(req, res, next);

    expect(res.boom.forbidden.calledOnce).to.be.true;
    expect(res.status).to.equal(403);
    expect(res.message).to.equal("Unauthorized access");
    expect(next.notCalled).to.be.true;
  });

  it("should call res.boom.forbidden() if userData.id is missing", function () {
    req.params.userId = "123";

    userAuthorization(req, res, next);

    expect(res.boom.forbidden.calledOnce).to.be.true;
    expect(res.status).to.equal(403);
    expect(res.message).to.equal("Unauthorized access");
    expect(next.notCalled).to.be.true;
  });

  it("should call res.boom.forbidden() if userId is missing", function () {
    req.userData.id = "123";

    userAuthorization(req, res, next);

    expect(res.boom.forbidden.calledOnce).to.be.true;
    expect(res.status).to.equal(403);
    expect(res.message).to.equal("Unauthorized access");
    expect(next.notCalled).to.be.true;
  });
});
