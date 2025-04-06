import { expect } from "chai";
import sinon from "sinon";

import {
  getTasksValidator,
  createTask,
  updateSelfTask,
  getUsersValidator,
  updateTask,
} from "../../../middlewares/validators/tasks.js";
import { TASK_STATUS, tasksUsersStatus } from "../../../constants/tasks.js";

describe("getTasks validator", function () {
  it("should pass the request when no values for query params status is passed", async function () {
    const req = {};
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when status query param has a valid task status value", async function () {
    const req = {
      query: {
        status: "DONE",
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
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
    const nextMiddlewareSpy = sinon.spy();
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
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when both valid status is passed", async function () {
    const req = {
      query: {
        status: "in_progress",
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when an invalid query param is passed", async function () {
    const req = {
      query: {
        sort: "asc",
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when incorrect page number is passed as parameter", async function () {
    const req = {
      query: {
        page: -1,
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when correct page number is passed as parameter", async function () {
    const req = {
      query: {
        page: 0,
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when incorrect size is passed as parameter", async function () {
    const req = {
      query: {
        size: 0,
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when size greater than 100 is passed as parameter", async function () {
    const req = {
      query: {
        size: 120,
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when correct size is passed as parameter", async function () {
    const req = {
      query: {
        size: 3,
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not pass the request when both next and page are passed as parameter", async function () {
    const req = {
      query: {
        next: "nextId",
        page: 0,
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when both prev and page are passed as parameter", async function () {
    const req = {
      query: {
        prev: "prevId",
        page: 0,
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not pass the request when both prev and next are passed as parameter", async function () {
    const req = {
      query: {
        next: "nextId",
        prev: "prevId",
      },
    };
    const res = {
      boom: {
        badRequest: sinon.spy(),
      },
    };
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when correct parameters are passed: next, status and size", async function () {
    const req = {
      query: {
        size: 3,
        next: "nextId",
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when correct parameters are passed: prev, status and size", async function () {
    const req = {
      query: {
        size: 3,
        prev: "prevId",
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when correct parameters are passed: page, status and size", async function () {
    const req = {
      query: {
        size: 3,
        page: 0,
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should pass the request when a valid query is provided", async function () {
    const req = {
      query: {
        size: 3,
        page: 0,
        status: TASK_STATUS.ASSIGNED,
        q: "searchterm:apple",
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should fail the request when an invalid query is provided", async function () {
    const req = {
      query: {
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
    const nextMiddlewareSpy = sinon.spy();
    await getTasksValidator(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should pass the request when correct parameters are passed: assignee, status and title", async function () {
    const req = {
      query: {
        assignee: "assignee",
        title: "title",
        status: TASK_STATUS.ASSIGNED,
      },
    };
    const res = {};
    const nextMiddlewareSpy = sinon.spy();
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

    const nextMiddlewareSpy = sinon.spy();

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

    const nextMiddlewareSpy = sinon.spy();

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

    const nextMiddlewareSpy = sinon.spy();

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
    const nextMiddlewareSpy = sinon.spy();
    try {
      await createTask(req, res, nextMiddlewareSpy);
      expect.fail("Should have thrown a bad request error");
    } catch (error) {
      expect(error);
    }
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should call nextMiddlewareSpy for updateTask if startedOn is null", async function () {
    const req = {
      body: {
        startedOn: null,
        endsOn: new Date().getTime(),
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should call nextMiddlewareSpy for updateTask if endsOn is null", async function () {
    const req = {
      body: {
        startedOn: new Date().getTime(),
        endsOn: null,
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should call nextMiddlewareSpy for updateTask if both startedOn and endsOn are null", async function () {
    const req = {
      body: {
        startedOn: null,
        endsOn: null,
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should call nextMiddlewareSpy for updateTask if both startedOn and endsOn are valid number", async function () {
    const req = {
      body: {
        startedOn: new Date("2023-11-15").getTime(),
        endsOn: new Date("2023-11-18").getTime(),
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(1);
  });

  it("should not call nextMiddlewareSpy for updateTask if startedOn is not null or a number", async function () {
    const req = {
      body: {
        startedOn: "December 6 2023",
        endsOn: new Date().getTime(),
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not call nextMiddlewareSpy for updateTask if endsOn is not null or a number", async function () {
    const req = {
      body: {
        startedOn: new Date().getTime(),
        endsOn: true,
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  it("should not call nextMiddlewareSpy for updateTask if both startedOn and endsOn is not null or a number", async function () {
    const req = {
      body: {
        startedOn: "December 6 2023",
        endsOn: true,
      },
    };
    const res = { boom: { badRequest: sinon.spy() } };
    const nextMiddlewareSpy = sinon.spy();
    await updateTask(req, res, nextMiddlewareSpy);
    expect(nextMiddlewareSpy.callCount).to.be.equal(0);
  });

  describe("getUsersValidator | Validator", function () {
    it("should pass the request when valid query parameters are provided", async function () {
      const req = {
        query: {
          size: 10,
          cursor: "someCursor",
          q: `status:${tasksUsersStatus.MISSED_UPDATES} -days-count:2 -date:123423432 -weekday:sun`,
        },
      };
      const res = {};
      const nextMiddlewareSpy = sinon.spy();
      await getUsersValidator(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });

    it("should pass the request when multiple valid query parameters are provided", async function () {
      const req = {
        query: {
          size: 10,
          cursor: "someCursor",
          q: `status:${tasksUsersStatus.MISSED_UPDATES} -days-count:2 -date:123423432 -weekday:sun -weekday:mon`,
        },
      };
      const res = {};
      const nextMiddlewareSpy = sinon.spy();
      await getUsersValidator(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });

    it("should pass the request when only required query parameters are provided", async function () {
      const req = {
        query: {
          q: `status:${tasksUsersStatus.MISSED_UPDATES}`,
        },
      };
      const res = {};
      const nextMiddlewareSpy = sinon.spy();
      await getUsersValidator(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(1);
    });

    it("should not pass validation when invalid query parameters are provided", async function () {
      const req = {
        query: {
          invalidParam: "someValue",
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextMiddlewareSpy = sinon.spy();
      await getUsersValidator(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });

    it("should not pass validation when required parameters are missing", async function () {
      const req = {
        query: {
          size: "someQuery",
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextMiddlewareSpy = sinon.spy();
      await getUsersValidator(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });

    it("should not pass validation when invalid filter parameters are provided", async function () {
      const req = {
        query: {
          q: "date:invalidOperator:2023-01-01",
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextMiddlewareSpy = sinon.spy();
      await getUsersValidator(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
      expect(res.boom.badRequest.callCount).to.be.equal(1);
    });
  });

  describe("updateSelfTask Validator", function () {
    it("should not pass the request when status is AVAILABLE", async function () {
      const req = {
        body: {
          status: "AVAILABLE",
        },
      };
      const res = {
        boom: {
          badRequest: sinon.spy(),
        },
      };
      const nextMiddlewareSpy = sinon.spy();
      await updateSelfTask(req, res, nextMiddlewareSpy);
      expect(nextMiddlewareSpy.callCount).to.be.equal(0);
    });
  });
});
