const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const { createRequest, addNewFields, removeOldField } = require("./../../../models/taskRequests");
const { TASK_REQUEST_TYPE, TASK_REQUEST_STATUS } = require("./../../../constants/taskRequests");
const mockData = require("../../fixtures/task-requests/task-requests");
const firestore = require("../../../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const cleanDb = require("../../utils/cleanDb");
const tasksModel = require("../../../models/tasks");

describe("Task requests", function () {
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

  describe("Task requests migrations", function () {
    const taskRequestId1 = "123";
    const taskRequestId2 = "123";

    const taskData = { taskData: { title: "hello" } };

    describe("addNewFields", function () {
      afterEach(async function () {
        sinon.restore();
        await cleanDb();
      });

      beforeEach(function () {
        sinon.stub(tasksModel, "fetchTask").resolves(taskData);
      });

      it("Should update the existing documents with single user", async function () {
        await taskRequestsCollection.doc(taskRequestId1).set(mockData.existingOldTaskRequest);
        await addNewFields();
        const taskRequestData = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        expect(taskRequestData.taskTitle).to.be.equal(taskData.taskData.title);
        expect(taskRequestData.users[0].userId).to.be.equal(mockData.existingOldTaskRequest.requestors[0]);
        expect(taskRequestData.requestType).to.be.equal(TASK_REQUEST_TYPE.ASSIGNMENT);
      });
      it("Should update the existing documents with multiple users", async function () {
        await Promise.all([
          taskRequestsCollection.doc(taskRequestId1).set(mockData.existingOldTaskRequest),
          taskRequestsCollection.doc(taskRequestId2).set(mockData.existingOldTaskRequestWithMultipleUsers),
        ]);
        await addNewFields();
        const taskRequestData1 = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        expect(taskRequestData1.taskTitle).to.be.equal(taskData.taskData.title);
        expect(taskRequestData1.users[0].userId).to.be.equal(mockData.existingOldTaskRequest.requestors[0]);
        expect(taskRequestData1.requestType).to.be.equal(TASK_REQUEST_TYPE.ASSIGNMENT);
        const taskRequestData2 = (await taskRequestsCollection.doc(taskRequestId2).get()).data();
        expect(taskRequestData2.taskTitle).to.be.equal(taskData.taskData.title);
        expect(taskRequestData2.users[0].userId).to.be.equal(
          mockData.existingOldTaskRequestWithMultipleUsers.requestors[0]
        );
        expect(taskRequestData2.users[1].userId).to.be.equal(
          mockData.existingOldTaskRequestWithMultipleUsers.requestors[1]
        );
        expect(taskRequestData2.requestType).to.be.equal(TASK_REQUEST_TYPE.ASSIGNMENT);
      });
    });

    describe("remove old fields", function () {
      it("Should remove the unnecessary fields", async function () {
        await taskRequestsCollection.doc(taskRequestId1).set(mockData.existingTaskRequest);
        await removeOldField();
        const taskRequestData = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        expect(taskRequestData.requestors).to.be.equal(undefined);
        expect(taskRequestData.approvedTo).to.be.equal(undefined);
      });

      it("Should not remove required fields", async function () {
        await taskRequestsCollection.doc(taskRequestId1).set(mockData.existingTaskRequest);
        await removeOldField();
        const taskRequestData = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        const taskRequest = mockData.existingTaskRequest;
        delete taskRequest.requestors;
        delete taskRequest.approvedTo;
        expect(taskRequestData).to.be.deep.equal(taskRequest);
      });
    });
  });
});
