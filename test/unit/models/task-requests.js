const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { createRequest } = require("./../../../models/taskRequests");
const { TASK_REQUEST_TYPE, TASK_REQUEST_STATUS } = require("./../../../constants/taskRequests");
const mockData = require("../../fixtures/task-requests/task-requests");
const firestore = require("../../../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const cleanDb = require("../../utils/cleanDb");

describe("createRequest", function () {
  const authenticatedUsername = "testUser";
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });
  it("should create a new task request when request type is creation", async function () {
    const requestData = mockData.taskRequestData;
    const result = await createRequest(requestData, authenticatedUsername);
    const addedTaskRequest = result.taskRequest;
    expect(addedTaskRequest.requestors).to.deep.equal([requestData.userId]);
    expect(addedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.PENDING);
    expect(addedTaskRequest.taskTitle).to.equal(requestData.taskTitle);
    expect(addedTaskRequest.taskId).to.equal(requestData.taskId);
    expect(addedTaskRequest.externalIssueUrl).to.equal(requestData.externalIssueUrl);
    expect(addedTaskRequest.users).to.deep.equal([
      {
        userId: requestData.userId,
        proposedDeadline: requestData.proposedDeadline,
        proposedStartDate: requestData.proposedStartDate,
        status: TASK_REQUEST_STATUS.PENDING,
        description: requestData.description,
      },
    ]);
    expect(addedTaskRequest.createdBy).to.equal(authenticatedUsername);
    expect(addedTaskRequest.createdAt).to.be.a("number");
    expect(addedTaskRequest.lastModifiedBy).to.equal(authenticatedUsername);
    expect(addedTaskRequest.lastModifiedAt).to.be.a("number");
    expect(result.isCreate).to.be.equal(true);
    expect(result.taskRequest).to.deep.equal(addedTaskRequest);
    expect(result.id).to.be.not.equal(undefined);
  });
  it("should let a new user request same task when request type is creation", async function () {
    await taskRequestsCollection.add(mockData.existingTaskRequest);
    const requestData = { ...mockData.taskRequestData, userId: "user456" };
    const result = await createRequest(requestData, authenticatedUsername);
    const addedTaskRequest = result.taskRequest;
    expect(addedTaskRequest).to.not.be.equal(undefined);
    expect(addedTaskRequest.requestors).to.deep.equal([...mockData.existingTaskRequest.requestors, requestData.userId]);
    expect(addedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.PENDING);
    expect(addedTaskRequest.taskTitle).to.not.be.equal(undefined);
    expect(addedTaskRequest.externalIssueUrl).to.equal(requestData.externalIssueUrl);
    expect(addedTaskRequest.users).to.deep.equal([
      ...mockData.existingTaskRequest.users,
      {
        userId: requestData.userId,
        proposedDeadline: requestData.proposedDeadline,
        proposedStartDate: requestData.proposedStartDate,
        status: TASK_REQUEST_STATUS.PENDING,
        description: requestData.description,
      },
    ]);
    expect(addedTaskRequest.createdBy).to.equal(mockData.existingTaskRequest.createdBy);
    expect(addedTaskRequest.createdAt).to.be.a("number");
    expect(addedTaskRequest.lastModifiedBy).to.equal(authenticatedUsername);
    expect(addedTaskRequest.lastModifiedAt).to.be.a("number");
    expect(result.isCreate).to.be.equal(false);
    expect(result.taskRequest).to.deep.equal(addedTaskRequest);
    expect(result.id).to.be.not.equal(undefined);
  });
  it("should handle the case where the user is already requesting in the existing request when request type is creation", async function () {
    await taskRequestsCollection.add(mockData.existingTaskRequest);
    const requestData = mockData.taskRequestData;
    const result = await createRequest(requestData, authenticatedUsername);
    expect(result.alreadyRequesting).to.be.equal(true);
  });
  it("should create a new task request when request type is assignment", async function () {
    const requestData = { ...mockData.taskRequestData, requestType: TASK_REQUEST_TYPE.ASSIGNMENT, taskId: "abc" };
    const result = await createRequest(requestData, authenticatedUsername);
    const addedTaskRequest = result.taskRequest;
    expect(addedTaskRequest.requestors).to.deep.equal([requestData.userId]);
    expect(addedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.PENDING);
    expect(addedTaskRequest.taskTitle).to.equal(requestData.taskTitle);
    expect(addedTaskRequest.taskId).to.equal(requestData.taskId);
    expect(addedTaskRequest.externalIssueUrl).to.equal(requestData.externalIssueUrl);
    expect(addedTaskRequest.users).to.deep.equal([
      {
        userId: requestData.userId,
        proposedDeadline: requestData.proposedDeadline,
        proposedStartDate: requestData.proposedStartDate,
        status: TASK_REQUEST_STATUS.PENDING,
        description: requestData.description,
      },
    ]);
    expect(addedTaskRequest.createdBy).to.equal(authenticatedUsername);
    expect(addedTaskRequest.createdAt).to.be.a("number");
    expect(addedTaskRequest.lastModifiedBy).to.equal(authenticatedUsername);
    expect(addedTaskRequest.lastModifiedAt).to.be.a("number");
    expect(result.isCreate).to.be.equal(true);
    expect(result.taskRequest).to.deep.equal(addedTaskRequest);
    expect(result.id).to.be.not.equal(undefined);
  });
  it("should let a new user request same task when request type is assignment", async function () {
    await taskRequestsCollection.add(mockData.existingTaskRequest);
    const requestData = {
      ...mockData.taskRequestData,
      userId: "user456",
      requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
      taskId: "task123",
    };
    const result = await createRequest(requestData, authenticatedUsername);
    const addedTaskRequest = result.taskRequest;
    expect(addedTaskRequest).to.not.be.equal(undefined);
    expect(addedTaskRequest.requestors).to.deep.equal([...mockData.existingTaskRequest.requestors, requestData.userId]);
    expect(addedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.PENDING);
    expect(addedTaskRequest.taskTitle).to.not.be.equal(undefined);
    expect(addedTaskRequest.taskId).to.equal(requestData.taskId);
    expect(addedTaskRequest.externalIssueUrl).to.equal(requestData.externalIssueUrl);
    expect(addedTaskRequest.users).to.deep.equal([
      ...mockData.existingTaskRequest.users,
      {
        userId: requestData.userId,
        proposedDeadline: requestData.proposedDeadline,
        proposedStartDate: requestData.proposedStartDate,
        status: TASK_REQUEST_STATUS.PENDING,
        description: requestData.description,
      },
    ]);
    expect(addedTaskRequest.createdBy).to.equal(mockData.existingTaskRequest.createdBy);
    expect(addedTaskRequest.createdAt).to.be.a("number");
    expect(addedTaskRequest.lastModifiedBy).to.equal(authenticatedUsername);
    expect(addedTaskRequest.lastModifiedAt).to.be.a("number");
    expect(result.isCreate).to.be.equal(false);
    expect(result.taskRequest).to.deep.equal(addedTaskRequest);
    expect(result.id).to.be.not.equal(undefined);
  });
  it("should handle the case where the user is already requesting in the existing request when request type is assignment", async function () {
    await taskRequestsCollection.add(mockData.existingTaskRequest);
    const requestData = { ...mockData.taskRequestData, requestType: TASK_REQUEST_TYPE.ASSIGNMENT, taskId: "task123" };
    const result = await createRequest(requestData, authenticatedUsername);
    expect(result.alreadyRequesting).to.be.equal(true);
  });
  it("should handle the case where the user is requesting an approved task/issue (CREATION)", async function () {
    await taskRequestsCollection.add({ ...mockData.existingTaskRequest, status: TASK_REQUEST_STATUS.APPROVED });
    const requestData = { ...mockData.taskRequestData };
    const result = await createRequest(requestData, authenticatedUsername);
    expect(result.isCreationRequestApproved).to.be.equal(true);
  });
});
