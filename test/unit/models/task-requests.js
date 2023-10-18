const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { createRequest, fetchTaskRequests } = require("./../../../models/taskRequests");
const { TASK_REQUEST_TYPE, TASK_REQUEST_STATUS } = require("./../../../constants/taskRequests");
const mockData = require("../../fixtures/task-requests/task-requests");
const firestore = require("../../../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const cleanDb = require("../../utils/cleanDb");
const userModel = require("../../../models/users");
const tasksModel = require("../../../models/tasks");

describe("Task requests", function () {
  const authenticatedUsername = "testUser";
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });
  describe("createRequest", function () {
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
      expect(addedTaskRequest.requestors).to.deep.equal([
        ...mockData.existingTaskRequest.requestors,
        requestData.userId,
      ]);
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
      expect(addedTaskRequest.requestors).to.deep.equal([
        ...mockData.existingTaskRequest.requestors,
        requestData.userId,
      ]);
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

  describe("fetchTaskRequests", function () {
    beforeEach(async function () {
      await taskRequestsCollection.add(mockData.existingTaskRequest);
      await taskRequestsCollection.add(mockData.existingOldTaskRequest);
    });
    it("should fetch all task requests", async function () {
      const result = await fetchTaskRequests();
      expect(result).to.be.an("array");
    });
    it("should fetch task requests with associated tasks and requestors", async function () {
      const taskData = { taskData: { title: "hello" } };
      const userData = { username: "hello" };
      sinon.stub(tasksModel, "fetchTask").resolves(taskData);
      sinon.stub(userModel, "fetchUser").resolves(userData);
      const result = await fetchTaskRequests();
      expect(result.length).to.be.equal(1);
      const fetchedTaskRequest = result[0];
      expect(fetchedTaskRequest.task).to.deep.equal(taskData.taskData);
      expect(fetchedTaskRequest.requestors[0]).to.deep.equal(userData);
    });
    it("should fetch task requests in development mode with associated requestors only", async function () {
      const taskData = { taskData: { title: "hello" } };
      const userData = { username: "hello" };
      sinon.stub(tasksModel, "fetchTask").resolves(taskData);
      sinon.stub(userModel, "fetchUser").resolves(userData);
      const result = await fetchTaskRequests(true);
      expect(result.length).to.be.equal(2);
      const fetchedOldTaskRequest = result[0];
      expect(fetchedOldTaskRequest.task).to.equal(taskData.taskData);
      expect(fetchedOldTaskRequest.requestors[0]).to.deep.equal(userData);
      const fetchedNewTaskRequest = result[1];
      expect(fetchedNewTaskRequest.task).to.equal(undefined);
      expect(fetchedNewTaskRequest.requestors[0]).to.deep.equal(userData);
    });
  });
});
