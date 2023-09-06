const Sinon = require("sinon");
const { getExtensionRequestsValidator } = require("../../../middlewares/validators/extensionRequests");
const { expect } = require("chai");
const { EXTENSION_REQUEST_STATUS } = require("../../../constants/extensionRequests");
describe("getExtensionRequestsValidator", function () {
  it("should pass the request when no values for query params is passed", async function () {
    const req = { query: {} };

    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should pass validation for valid query parameters when dev is 'false'", async function () {
    const req = {
      query: {
        dev: false,
        cursor: "value",
        order: "asc",
        size: 10,
        status: EXTENSION_REQUEST_STATUS.PENDING,
        assignee: "user123",
        taskId: "task123",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should not pass validation for invalid query parameters when dev is 'false'", async function () {
    const req = {
      query: {
        dev: false,
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

  it("should pass validation for valid query parameters with arrays when dev is 'false'", async function () {
    const req = {
      query: {
        dev: false,
        status: [EXTENSION_REQUEST_STATUS.PENDING, EXTENSION_REQUEST_STATUS.APPROVED],
        assignee: ["user123", "user456"],
        taskId: ["task123", "task456"],
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should pass validation for valid query parameters when dev is 'true'", async function () {
    const req = {
      query: {
        dev: true,
        q: "assignee:user123",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass validation for valid query parameters query string when dev is 'true'", async function () {
    const req = {
      query: {
        dev: true,
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
  it("should pass validation for valid multiple keys and values of query parameters when dev is 'true'", async function () {
    const req = {
      query: {
        dev: true,
        q: "assignee:user123+user456,status:PENDING+APPROVED",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();

    await getExtensionRequestsValidator(req, res, nextMiddlewareSpy);

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should not pass validation for invalid query parameters query string when dev is 'true'", async function () {
    const req = {
      query: {
        dev: true,
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
  it("should not pass validation for invalid query parameters when dev is 'true'", async function () {
    const req = {
      query: {
        dev: false,
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
