const { updateTask } = require("../../../middlewares/validators/tasks"); // Replace with the actual path to your updateTask module
const { expect } = require("chai");
const sinon = require("sinon");

describe("updateTask function", function () {
  // Helper function to create a request object with a specific body
  const createRequest = (body) => ({ body });

  // Helper function to create a response object with a mocked boom function
  const createResponse = () => ({
    boom: {
      badRequest: sinon.stub().returns({ error: true, message: "Bad Request" }),
    },
  });

  // Helper function to create a next function that simply calls done
  const createNext = () => sinon.stub();

  afterEach(function () {
    sinon.restore();
  });

  it("validates a valid request body", async function () {
    const validRequestBody = {
      title: "Sample Task",
      purpose: "Test purposes",
      type: "Sample Type",
      status: "active",
      isNoteworthy: true,
      isCollapsed: false,
    };

    const req = createRequest(validRequestBody);
    const res = createResponse();
    const next = createNext();

    await updateTask(req, res, next);

    expect(res.boom.badRequest.calledOnce).to.be.equal(false);
    expect(next.calledOnce).to.be.equal(true);
  });

  it("handles invalid request body", async function () {
    const invalidRequestBody = {
      // Missing required fields, or incorrect data types
      title: 123,
      purpose: 456,
      type: true,
      status: "invalid_status",
      isNoteworthy: "yes",
      isCollapsed: "no",
      assignee: "",
    };

    const req = createRequest(invalidRequestBody);
    const res = createResponse();
    const next = createNext();

    await updateTask(req, res, next);

    expect(res.boom.badRequest.calledOnce).to.be.equal(true);
    expect(next.calledOnce).to.be.equal(false);
  });
});
