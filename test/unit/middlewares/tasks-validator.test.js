const Sinon = require("sinon");
const { getTasksValidator, createTask } = require("../../../middlewares/validators/tasks");
const { expect } = require("chai");
const { TASK_STATUS } = require("../../../constants/tasks");

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
    expect(res.boom.badRequest.callCount).to.be.equal(1);
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

  it("should not pass the request when incorrect page number is passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        page: -1,
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

  it("should pass the request when correct page number is passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        page: 0,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when incorrect size is passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        size: 0,
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

  it("should not pass the request when size greater than 100 is passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        size: 120,
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

  it("should pass the request when correct size is passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        size: 3,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when both next and page are passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        next: "nextId",
        page: 0,
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

  it("should not pass the request when both prev and page are passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        prev: "prevId",
        page: 0,
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

  it("should not pass the request when both prev and next are passed as parameter", async function () {
    const req = {
      query: {
        dev: "true",
        next: "nextId",
        prev: "prevId",
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

  it("should pass the request when correct parameters are passed: next, dev, status and size", async function () {
    const req = {
      query: {
        dev: "true",
        size: 3,
        next: "nextId",
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when correct parameters are passed: prev, dev, status and size", async function () {
    const req = {
      query: {
        dev: "true",
        size: 3,
        prev: "prevId",
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when correct parameters are passed: page, dev, status and size", async function () {
    const req = {
      query: {
        dev: "true",
        size: 3,
        page: 0,
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should pass the request when a valid query is provided", async function () {
    const req = {
      query: {
        dev: "true",
        size: 3,
        page: 0,
        status: TASK_STATUS.ASSIGNED,
        q: "searchterm:apple",
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should fail the request when an invalid query is provided", async function () {
    const req = {
      query: {
        dev: "true",
        size: 3,
        page: 0,
        status: TASK_STATUS.ASSIGNED,
        q: "invalidkey:value",
      },
    };
    const res = {
      boom: {
        badRequest: (message) => {
          expect(message).to.equal('"q" contains an invalid value');
        },
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });
  it("should pass the request when correct parameters are passed: assignee, dev, status and title", async function () {
    const req = {
      query: {
        dev: "true",
        assignee: "assignee",
        title: "title",
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = Sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });
  it("should pass when valid request body is provided", async function () {
    const validRequestBody = {
      title: "Sample Task",
      type: "Feature",
      status: TASK_STATUS.ASSIGNED,
      priority: "High",
      percentCompleted: 0,
    };

    const req = {
      body: validRequestBody,
    };
    const res = {
      boom: {
        badRequest: (message) => {
          throw new Error(message);
        },
      },
    };

    const nextMiddlewareSpy = Sinon.spy();

    try {
      await createTask(req, res, nextMiddlewareSpy);
    } catch (error) {
      expect.fail("Should not have thrown an error");
    }

    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should return a bad request error when empty request body is provided", async function () {
    const invalidRequestBody = {};
    const req = {
      body: invalidRequestBody,
    };
    const res = {
      boom: {
        badRequest: (message) => {
          return message;
        },
      },
    };

    const nextMiddlewareSpy = Sinon.spy();

    try {
      await createTask(req, res, nextMiddlewareSpy);
      expect.fail("Should have thrown a bad request error");
    } catch (error) {
      expect(error);
    }

    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass when html_url in github request body is a valid URL", async function () {
    const validRequestBody = {
      title: "Sample Task",
      type: "Feature",
      status: TASK_STATUS.ASSIGNED,
      priority: "High",
      percentCompleted: 0,
      github: {
        issue: {
          html_url: "https://github.com/issue-url",
        },
      },
    };

    const req = {
      body: validRequestBody,
    };
    const res = {
      boom: {
        badRequest: (message) => {
          return message;
        },
      },
    };

    const nextMiddlewareSpy = Sinon.spy();

    try {
      await createTask(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    } catch (error) {
      expect.fail("Should not have thrown a validation error");
    }
  });

  it("should fail when html_url in github request body is not a valid URL", async function () {
    const invalidRequestBody = {
      title: "Sample Task",
      type: "Feature",
      status: TASK_STATUS.ASSIGNED,
      priority: "High",
      percentCompleted: 0,
      github: {
        issue: {
          html_url: "invalid-url",
        },
      },
    };
    const req = {
      body: invalidRequestBody,
    };
    const res = {
      boom: {
        badRequest: (message) => {
          return message;
        },
      },
    };
    const nextMiddlewareSpy = Sinon.spy();
    try {
      await createTask(req, res, nextMiddlewareSpy);
      expect.fail("Should have thrown a bad request error");
    } catch (error) {
      expect(error);
    }
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });
});
