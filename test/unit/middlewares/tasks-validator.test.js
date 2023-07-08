const Sinon = require("sinon");
const { getTasksValidator } = require("../../../middlewares/validators/tasks");
const { expect } = require("chai");

describe("getTasks validator", function () {
  it("should pass the request when no values for query params dev or status is passed", async function () {
    const req = {};
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when dev query param value is boolean", async function () {
    const req = {
      query: {
        dev: true,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when dev query param has a boolean value of type string", async function () {
    const req = {
      query: {
        dev: "true",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when dev query param value is not a boolean value", async function () {
    const req = {
      query: {
        dev: "yes",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when status query param has a valid task status value", async function () {
    const req = {
      query: {
        status: "DONE",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when status query param has a case-insensitive valid task status value", async function () {
    const req = {
      query: {
        status: "done",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when status query param has an invalid task status value", async function () {
    const req = {
      query: {
        status: "testing_in_progress",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when both valid status and dev query param values are passed", async function () {
    const req = {
      query: {
        status: "in_progress",
        dev: true,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when status query param value is valid but dev query param value is invalid", async function () {
    const req = {
      query: {
        status: "in_progress",
        dev: "no",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when dev query param value is valid but status query param value is invalid", async function () {
    const req = {
      query: {
        status: "testing_in_progress",
        dev: "false",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when an invalid query param is passed", async function () {
    const req = {
      query: {
        sort: "asc",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when an insensitive dev query param value is passed", async function () {
    const req = {
      query: {
        dev: "True",
      },
    };
    const res = {
      boom: {
        badRequest: Sinon.spy(),
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });
});
