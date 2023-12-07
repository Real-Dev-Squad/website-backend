const Sinon = require("sinon");
const { getExtensionRequestsValidator } = require("../../../middlewares/validators/extensionRequests");
const { expect } = require("chai");
describe("getExtensionRequestsValidator", function () {
  it("should pass the request when no values for query params is passed", async function () {
    const req = { query: {} };

    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should pass validation for valid query parameters", async function () {
    const req = {
      query: {
        q: "assignee:user123",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass validation for valid query parameters query string", async function () {
    const req = {
      query: {
        cursor: "value",
        order: "asc",
        size: 10,
        q: "assignee:user123+user456",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should pass validation for valid multiple keys and values of query parameters", async function () {
    const req = {
      query: {
        q: "assignee:user123+user456,status:PENDING+APPROVED",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should not pass validation for invalid query parameters query string", async function () {
    const req = {
      query: {
        q: "invalidkey:value",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
    expect(res.boom.badRequest.callCount).to.be.equal(1);
  });
  it("should not pass validation for invalid query parameters", async function () {
    const req = {
      query: {
        invalidParam: "value",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
    expect(res.boom.badRequest.callCount).to.be.equal(1);
  });
});
