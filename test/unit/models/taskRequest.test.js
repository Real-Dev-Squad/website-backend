const chai = require("chai");
const { expect } = chai;

const cleanDb = require("../../utils/cleanDb");
const userData = require("../../fixtures/user/user")();
const addUser = require("../../utils/addUser");
const taskModel = require("../../../models/tasks");
const taskData = require("../../fixtures/tasks/tasks")();
const taskRequestModel = require("../../../models/taskRequests");
const userModel = require("../../../models/users");
const { TASK_STATUS } = require("../../../constants/tasks");
const { TASK_REQUEST_STATUS } = require("../../../constants/taskRequests");

describe("Task Request", function () {
  afterEach(async function () {
    await cleanDb();
  });

  describe("addOrUpdate", function () {
    let user0, user1, task;

    beforeEach(async function () {
      user0 = await addUser(userData[9]);
      user1 = await addUser(userData[10]);
      task = await taskModel.updateTask(taskData[4]);
    });

    it("should add the taskRequest if no taskRequest is present for taskId", async function () {
      const result = await taskRequestModel.addOrUpdate(task.taskId, user0);

      expect(result).to.be.an("object");
      expect(result).to.have.all.keys("isCreate", "id", "taskRequest");
      expect(result.isCreate).to.be.eq(true);
      expect(result.taskRequest).to.be.an("object");
      expect(result.taskRequest).to.have.all.keys("requestors", "status", "taskId");
      expect(result.taskRequest.requestors).to.have.length(1);
      expect(result.taskRequest.requestors[0]).to.be.eq(user0);
      expect(result.taskRequest.status).to.be.eq(TASK_REQUEST_STATUS.WAITING);
    });

    it("should update requestors if a new user requests for existing task", async function () {
      await taskRequestModel.addOrUpdate(task.taskId, user0);
      const result = await taskRequestModel.addOrUpdate(task.taskId, user1);

      expect(result).to.be.an("object");
      expect(result).to.have.all.keys("isCreate", "requestors");
      expect(result).to.have.property("isCreate");
      expect(result.isCreate).to.be.eq(false);
      expect(result.requestors).to.have.length(2);
      expect(result.requestors).to.be.eql([user0, user1]);
    });

    it("should return object with key alreadyRequesting for same userId", async function () {
      await taskRequestModel.addOrUpdate(task.taskId, user0);
      const result = await taskRequestModel.addOrUpdate(task.taskId, user0);

      expect(result).to.be.an("object");
      expect(result).to.have.property("alreadyRequesting");
      expect(result.alreadyRequesting).to.be.eq(true);
    });
  });

  describe("fetchTaskRequests", function () {
    let user, task;
    beforeEach(async function () {
      user = await addUser(userData[9]);
      task = await taskModel.updateTask(taskData[4]);
    });

    it("should return an empty array if no task requests is there", async function () {
      const result = await taskRequestModel.fetchTaskRequests();

      expect(result).to.be.an("Array");
      expect(result).to.have.length(0);
    });

    it("should fetch the task requests with task and user information", async function () {
      await taskRequestModel.addOrUpdate(task.taskId, user);
      const result = await taskRequestModel.fetchTaskRequests();

      expect(result).to.be.an("Array");
      expect(result).to.have.length(1);
      expect(result[0]).to.have.all.keys("requestors", "task", "id", "status", "taskId", "url");
      expect(result[0].requestors).to.be.an("Array");
      expect(result[0].requestors).to.have.length(1);
      expect(result[0].task).to.be.an("object");
    });
  });

  describe("fetchTaskRequestById", function () {
    let taskRequestId, user, task;

    beforeEach(async function () {
      user = await addUser(userData[9]);
      task = await taskModel.updateTask(taskData[4]);
    });

    it("should return object with key taskRequestExists with value as false", async function () {
      const result = await taskRequestModel.fetchTaskRequestById("taskRequestId");

      expect(result).to.be.an("object");
      expect(result).to.have.property("taskRequestExists");
      expect(result.taskRequestExists).to.be.eq(false);
      expect(result).to.not.have.property("taskRequestData");
    });

    it("should fetch task request by task request id", async function () {
      taskRequestId = (await taskRequestModel.addOrUpdate(task.taskId, user)).id;
      const result = await taskRequestModel.fetchTaskRequestById(taskRequestId);

      expect(result).to.be.an("object");
      expect(result).to.have.all.keys("taskRequestExists", "taskRequestData");
      expect(result.taskRequestExists).to.be.eq(true);
      expect(result.taskRequestData).to.be.an("object");
      expect(result.taskRequestData).to.have.all.keys("requestors", "taskId", "status", "id", "url");
      expect(result.taskRequestData.requestors).to.be.eql([user]);
      expect(result.taskRequestData.taskId).to.be.eq(task.taskId);
      expect(result.taskRequestData.status).to.be.eq(TASK_REQUEST_STATUS.WAITING);
      expect(result.taskRequestData.id).to.be.eq(taskRequestId);
    });
  });

  describe("approveTaskRequest", function () {
    let userId, task, taskRequest;

    beforeEach(async function () {
      userId = await addUser(userData[9]);
      task = await taskModel.updateTask(taskData[4]);
      taskRequest = await taskRequestModel.addOrUpdate(task.taskId, userId);
    });

    it("should approve the task request and task model", async function () {
      const { user } = await userModel.fetchUser({ userId });
      await taskRequestModel.approveTaskRequest(taskRequest.id, user);

      const resultTaskRequest = await taskRequestModel.fetchTaskRequestById(taskRequest.id);
      const resultTask = await taskModel.fetchTask(task.taskId);

      expect(resultTaskRequest).to.be.an("object");
      expect(resultTaskRequest).to.have.all.keys("taskRequestExists", "taskRequestData");
      expect(resultTaskRequest.taskRequestExists).to.be.eq(true);
      expect(resultTaskRequest.taskRequestData).to.have.property("status");
      expect(resultTaskRequest.taskRequestData.status).to.be.eq(TASK_REQUEST_STATUS.APPROVED);
      expect(resultTaskRequest.taskRequestData).to.have.property("approvedTo");
      expect(resultTaskRequest.taskRequestData.approvedTo).to.be.eq(userId);

      expect(resultTask).to.be.an("object");
      expect(resultTask).to.have.property("taskData");
      expect(resultTask.taskData).to.be.an("object");
      expect(resultTask.taskData).to.have.property("status");
      expect(resultTask.taskData.status).to.be.eq(TASK_STATUS.ASSIGNED);
      expect(resultTask.taskData).to.have.property("assignee");
      expect(resultTask.taskData.assignee).to.be.eq(userData[9].username);
    });
  });
});
