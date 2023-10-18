const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { approveTaskRequest } = require("./../../../models/taskRequests");
const { TASK_REQUEST_TYPE, TASK_REQUEST_STATUS } = require("./../../../constants/taskRequests");
const mockData = require("../../fixtures/task-requests/task-requests");
const firestore = require("../../../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const tasksCollection = firestore.collection("tasks");
const cleanDb = require("../../utils/cleanDb");
const tasksData = require("../../fixtures/tasks/tasks")();
const tasksModel = firestore.collection("tasks");

describe("approveTaskRequest", function () {
  const user = { id: "user123", username: "testUser" };
  const taskRequestId = "taskRequest123";

  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  it("should approve a task request for creation", async function () {
    const existingTaskRequest = { ...mockData.existingTaskRequest, requestType: TASK_REQUEST_TYPE.CREATION };
    await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
    const result = await approveTaskRequest(taskRequestId, user);
    const approvedTaskRequest = result.taskRequest;
    expect(approvedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.APPROVED);
    expect(approvedTaskRequest.approvedTo).to.equal(user.id);
    expect(approvedTaskRequest.users[0].status).to.equal(TASK_REQUEST_STATUS.APPROVED);
    const approvedTask = await tasksCollection.doc(approvedTaskRequest.taskId).get();
    expect(approvedTask.exists).to.be.equal(true);
    expect(approvedTask.data().assignee).to.equal(user.id);
  });
  it("should approve a task request for assignment", async function () {
    const existingTaskRequest = { ...mockData.existingTaskRequest, requestType: TASK_REQUEST_TYPE.ASSIGNMENT };
    await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
    await tasksModel.doc(existingTaskRequest.taskId).set(tasksData[0]);
    const result = await approveTaskRequest(taskRequestId, user);
    const approvedTaskRequest = result.taskRequest;
    expect(approvedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.APPROVED);
    expect(approvedTaskRequest.approvedTo).to.equal(user.id);
    expect(approvedTaskRequest.users[0].status).to.equal(TASK_REQUEST_STATUS.APPROVED);
    const approvedTask = await tasksCollection.doc(approvedTaskRequest.taskId).get();
    expect(approvedTask.exists).to.be.equal(true);
    expect(approvedTask.data().assignee).to.equal(user.id);
  });
  it("should handle invalid user for approval", async function () {
    const existingTaskRequest = { ...mockData.existingTaskRequest };
    await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
    const invalidUser = { id: "invalidUserId", username: "invalidUser" };
    const result = await approveTaskRequest(taskRequestId, invalidUser);
    expect(result.isUserInvalid).to.be.equal(true);
  });
  it("should handle task request not found", async function () {
    const result = await approveTaskRequest("nonExistentTaskRequestId", user);
    expect(result.taskRequestNotFound).to.be.equal(true);
  });
  it("should handle invalid task request status", async function () {
    const existingTaskRequest = { ...mockData.existingTaskRequest, status: TASK_REQUEST_STATUS.APPROVED };
    await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
    const result = await approveTaskRequest(taskRequestId, user);
    expect(result.isTaskRequestInvalid).to.be.equal(true);
  });
  it("should throw an error for general approval failure", async function () {
    sinon.stub(firestore, "runTransaction").rejects(new Error("Transaction failed"));
    try {
      await approveTaskRequest(taskRequestId, user);
      expect.fail("Error in approving task: Transaction failed");
    } catch (err) {
      expect(err.message).to.equal("Transaction failed");
    }
  });
});
