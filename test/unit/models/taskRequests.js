const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { fetchTaskRequests } = require("./../../../models/taskRequests");
const mockData = require("../../fixtures/task-requests/task-requests");
const firestore = require("../../../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const cleanDb = require("../../utils/cleanDb");
const userModel = require("../../../models/users");
const tasksModel = require("../../../models/tasks");

describe("Task requests", function () {
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
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
    it("should fetch task requests with associated tasks and requestors of only the old task request models when dev is false", async function () {
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
    it("should fetch task requests in development mode with associated requestors of all task request models when dev is true", async function () {
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
