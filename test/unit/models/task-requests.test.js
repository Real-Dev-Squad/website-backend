const chai = require("chai");
const sinon = require("sinon");
const { expect } = chai;
const {
  createRequest,
  fetchTaskRequests,
  approveTaskRequest,
  fetchPaginatedTaskRequests,
  addNewFields,
  removeOldField,
} = require("./../../../models/taskRequests");
const {
  TASK_REQUEST_TYPE,
  TASK_REQUEST_STATUS,
  TASK_REQUEST_ERROR_MESSAGE,
} = require("./../../../constants/taskRequests");

const mockData = require("../../fixtures/task-requests/task-requests");
const firestore = require("../../../utils/firestore");
const taskRequestsCollection = firestore.collection("taskRequests");
const cleanDb = require("../../utils/cleanDb");
const userModel = require("../../../models/users");
const tasksModel = require("../../../models/tasks");
const usersService = require("../../../services/dataAccessLayer");

const tasksCollection = firestore.collection("tasks");
const { TASK_STATUS, DEFAULT_TASK_PRIORITY } = require("../../../constants/tasks");
const tasksData = require("../../fixtures/tasks/tasks")();
const userData = require("../../fixtures/user/user")();

describe("Task requests | models", function () {
  afterEach(async function () {
    sinon.restore();
    await cleanDb();
  });

  describe("createRequest", function () {
    const authenticatedUsername = "testUser";

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
      const requestData = {
        ...mockData.taskRequestData,
        requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
        taskId: "task123",
      };
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
      const approvedTaskRequest = {
        ...mockData.existingTaskRequest,
        status: TASK_REQUEST_STATUS.APPROVED,
        createdAt: Date.now(),
        usersCount: 1,
      };
      const assignmentTaskRequest = {
        ...mockData.existingTaskRequest,
        requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
        createdAt: Date.now() + 10000,
        usersCount: 2,
      };
      const existingTaskRequest = { ...mockData.existingTaskRequest, createdAt: Date.now() + 20000, usersCount: 3 };
      await Promise.all([
        taskRequestsCollection.add(existingTaskRequest),
        taskRequestsCollection.add(mockData.existingOldTaskRequest),
        taskRequestsCollection.add(approvedTaskRequest),
        taskRequestsCollection.add(assignmentTaskRequest),
      ]);
      const userDetails = userData[0];
      userDetails.id = mockData.existingTaskRequest.users[0].userId;

      sinon.stub(usersService, "fetchUsersForKeyValues").resolves([userDetails]);
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
      expect(result.length).to.be.equal(4);
      const fetchedOldTaskRequest = result[0];
      expect(fetchedOldTaskRequest.task).to.equal(taskData.taskData);
      expect(fetchedOldTaskRequest.requestors[0]).to.deep.equal(userData);
      const fetchedNewTaskRequest = result[1];
      expect(fetchedNewTaskRequest.task).to.equal(undefined);
      expect(fetchedNewTaskRequest.requestors[0]).to.deep.equal(userData);
    });
    it("should fetch all task requests when no queries are passed", async function () {
      const result = await fetchPaginatedTaskRequests();
      expect(result).to.have.any.key("data");
      expect(result).to.have.any.key("prev");
      expect(result).to.have.any.key("next");
      expect(result.data).to.be.an("array");
    });
    it("should fetch only task requests of status pending", async function () {
      const queries = {
        q: "status:pending",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      result.data.forEach((taskRequest) => {
        expect(taskRequest.status).to.equal(TASK_REQUEST_STATUS.PENDING);
      });
    });
    it("should fetch only task requests of status approved and request type of assignment", async function () {
      const queries = {
        q: "status:approved request-type:assignment",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      result.data.forEach((taskRequest) => {
        expect(taskRequest.status).to.equal(TASK_REQUEST_STATUS.APPROVED);
        expect(taskRequest.requestType).to.equal(TASK_REQUEST_TYPE.ASSIGNMENT);
      });
    });
    it("should limit the response list to size 1", async function () {
      const queries = {
        size: "1",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      expect(result.data.length).to.be.equal(1);
    });
    it("should sort the response in descending order of created time", async function () {
      const queries = {
        q: "sort:created-desc",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      const createdTimeList = result.data.map((data) => data.createdAt);
      const createdTimeListInDescending = [...createdTimeList];
      createdTimeListInDescending.sort((a, b) => b - a);
      expect(createdTimeList).to.be.deep.equal(createdTimeListInDescending);
    });
    it("should sort the response in ascending order of requestors count", async function () {
      const queries = {
        q: "sort:requestors-asc",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      const usersCountList = result.data.map((data) => data.usersCount);
      const usersCountListInAscending = [...usersCountList];
      usersCountListInAscending.sort();
      expect(usersCountList).to.be.deep.equal(usersCountListInAscending);
    });

    it("should provide next set of results when next is passed in query param", async function () {
      const queries = {
        q: "sort:requestors-asc",
        size: "1",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      expect(result.next).to.be.not.equal(undefined);
      expect(result.data.length).to.be.equal(1);
      queries.next = result.data[0].id;
      const nextResult = await fetchPaginatedTaskRequests(queries);
      expect(nextResult.data.length).to.be.equal(1);
      expect(nextResult.data[0].usersCount).to.be.greaterThan(result.data[0].usersCount);
    });
    it("should provide previous set of results when prev is passed in query param", async function () {
      const queries = {
        q: "sort:requestors-asc",
        size: "1",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      expect(result.next).to.be.not.equal(undefined);
      expect(result.data.length).to.be.equal(1);
      queries.next = result.data[0].id;
      const nextResult = await fetchPaginatedTaskRequests(queries);
      delete queries.next;
      queries.prev = nextResult.data[0].id;
      const prevResult = await fetchPaginatedTaskRequests(queries);
      expect(prevResult.data[0]).to.be.deep.equal(result.data[0]);
    });
    it("should return error when an invalid next value is passed", async function () {
      const queries = {
        next: "abc",
        size: "1",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      expect(result).to.be.deep.equal({
        statusCode: 400,
        error: "Bad Request",
        message: `${TASK_REQUEST_ERROR_MESSAGE.INVALID_NEXT}: ${queries.next}`,
      });
    });
    it("should return error when an invalid prev value is passed", async function () {
      const queries = {
        prev: "abc",
        size: "1",
      };
      const result = await fetchPaginatedTaskRequests(queries);
      expect(result).to.be.deep.equal({
        statusCode: 400,
        error: "Bad Request",
        message: `${TASK_REQUEST_ERROR_MESSAGE.INVALID_PREV}: ${queries.prev}`,
      });
    });
  });

  describe("approveTaskRequest", function () {
    const user = { id: "user123", username: "testUser" };
    const taskRequestId = "taskRequest123";

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
      expect(approvedTask.data().status).to.equal(TASK_STATUS.ASSIGNED);
      expect(approvedTask.data().percentCompleted).to.equal(0);
      expect(approvedTask.data().priority).to.equal(DEFAULT_TASK_PRIORITY);
    });
    it("should approve a task request for assignment", async function () {
      const existingTaskRequest = { ...mockData.existingTaskRequest, requestType: TASK_REQUEST_TYPE.ASSIGNMENT };
      await taskRequestsCollection.doc(taskRequestId).set(existingTaskRequest);
      await tasksCollection.doc(existingTaskRequest.taskId).set(tasksData[0]);
      const result = await approveTaskRequest(taskRequestId, user);
      const approvedTaskRequest = result.taskRequest;
      expect(approvedTaskRequest.status).to.equal(TASK_REQUEST_STATUS.APPROVED);
      expect(approvedTaskRequest.approvedTo).to.equal(user.id);
      expect(approvedTaskRequest.users[0].status).to.equal(TASK_REQUEST_STATUS.APPROVED);
      const approvedTask = await tasksCollection.doc(approvedTaskRequest.taskId).get();
      expect(approvedTask.exists).to.be.equal(true);
      expect(approvedTask.data().assignee).to.equal(user.id);
      expect(approvedTask.data().status).to.equal(TASK_STATUS.ASSIGNED);
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

  describe("Task requests migrations", function () {
    const taskRequestId1 = "123";
    const taskRequestId2 = "456";

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
        const response = await addNewFields();
        const taskRequestData = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        expect(response.totalDocuments).to.be.equal(1);
        expect(response.documentsModified).to.be.equal(1);
        expect(taskRequestData.taskTitle).to.be.equal(taskData.taskData.title);
        expect(taskRequestData.users[0].userId).to.be.equal(mockData.existingOldTaskRequest.requestors[0]);
        expect(taskRequestData.requestType).to.be.equal(TASK_REQUEST_TYPE.ASSIGNMENT);
      });
      it("Should not update documents with new schema", async function () {
        await taskRequestsCollection.doc(taskRequestId1).set(mockData.existingTaskRequest);
        const response = await addNewFields();
        expect(response.totalDocuments).to.be.equal(1);
        expect(response.documentsModified).to.be.equal(0);
      });
      it("Should update the existing documents with multiple users", async function () {
        await Promise.all([
          taskRequestsCollection.doc(taskRequestId1).set(mockData.existingOldTaskRequest),
          taskRequestsCollection.doc(taskRequestId2).set(mockData.existingOldTaskRequestWithMultipleUsers),
        ]);
        const response = await addNewFields();
        expect(response.totalDocuments).to.be.equal(2);
        expect(response.documentsModified).to.be.equal(2);
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
        const response = await removeOldField();
        expect(response.totalDocuments).to.be.equal(1);
        expect(response.documentsModified).to.be.equal(1);
        const taskRequestData = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        expect(taskRequestData.requestors).to.be.equal(undefined);
        expect(taskRequestData.approvedTo).to.be.equal(undefined);
      });
      it("Should not update documents with new schema", async function () {
        const { requestors, ...taskRequest } = mockData.existingTaskRequest;
        await taskRequestsCollection.doc(taskRequestId1).set(taskRequest);
        const response = await removeOldField();
        expect(response.totalDocuments).to.be.equal(1);
        expect(response.documentsModified).to.be.equal(0);
      });
      it("Should not remove required fields", async function () {
        await taskRequestsCollection.doc(taskRequestId1).set(mockData.existingTaskRequest);
        const response = await removeOldField();
        expect(response.totalDocuments).to.be.equal(1);
        expect(response.documentsModified).to.be.equal(1);
        const taskRequestData = (await taskRequestsCollection.doc(taskRequestId1).get()).data();
        const taskRequest = mockData.existingTaskRequest;
        delete taskRequest.requestors;
        delete taskRequest.approvedTo;
        expect(taskRequestData).to.be.deep.equal(taskRequest);
      });
    });
  });
});
