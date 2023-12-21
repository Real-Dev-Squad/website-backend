const { TASK_REQUEST_TYPE } = require("../../../constants/taskRequests");
const validAssignmentRequest = {
  taskId: "1234",
  externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website-status/issues/1564672",
  requestType: "ASSIGNMENT",
  userId: "7890",
  proposedDeadline: 1243455234,
  proposedStartDate: 1243405234,
};
const { taskId: tarTaskId, ...assignmentReqWithoutTaskId } = validAssignmentRequest;
const { userId: tarUserId, ...assignmentReqWithoutUserId } = validAssignmentRequest;
const { proposedDeadline: tarProposedDeadline, ...assignmentReqWithoutProposedDeadline } = validAssignmentRequest;
const { externalIssueUrl: tarExternalIssueUrl, ...assignmentReqWithoutExtIssueId } = validAssignmentRequest;
const assignmentReqWithDescription = { ...validAssignmentRequest, description: "something something" };
const validCreationRequest = {
  externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website-status/issues/1564672",
  requestType: "CREATION",
  userId: "7890",
  proposedDeadline: 1243455234,
  proposedStartDate: 1243405234,
};
const creationReqWithTaskId = { ...validCreationRequest, taskId: "1234" };
const { userId: tcrUserId, ...creationReqWithoutUserId } = validCreationRequest;
const { proposedDeadline: tcrProposedDeadline, ...creationReqWithoutProposedDeadline } = validCreationRequest;
const { externalIssueUrl: tcrExternalIssueUrl, ...creationReqWithoutExtIssueId } = validCreationRequest;
const creationReqWithDescription = { ...validCreationRequest, description: "something something" };
const invalidRequest = {
  hello: "world",
};
const taskRequestData = {
  userId: "user123",
  proposedDeadline: 1697452226700,
  proposedStartDate: 1697452226700,
  description: "Task description",
  requestType: TASK_REQUEST_TYPE.CREATION,
  externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website-backend/issues/1599",
};
const existingTaskRequest = {
  requestors: ["user123"],
  status: "PENDING",
  taskTitle: "Task Title",
  taskId: "task123",
  externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website-backend/issues/1599",
  requestType: "CREATION",
  users: [
    {
      userId: "user123",
      proposedDeadline: 1697452226789,
      proposedStartDate: 1697452226789,
      description: "Task description",
      status: "PENDING",
    },
  ],
  createdBy: "testUser",
  createdAt: 1697452229369,
  lastModifiedBy: "testUser",
  lastModifiedAt: 1697452229369,
};
const existingOldTaskRequest = {
  requestors: ["user123"],
  status: "PENDING",
  taskId: "task123",
};
const existingOldTaskRequestWithMultipleUsers = {
  requestors: ["user123", "user456"],
  status: "PENDING",
  taskId: "task456",
};
module.exports = {
  existingOldTaskRequest,
  taskRequestData,
  existingTaskRequest,
  validAssignmentRequest,
  assignmentReqWithoutTaskId,
  assignmentReqWithoutUserId,
  assignmentReqWithoutProposedDeadline,
  assignmentReqWithoutExtIssueId,
  assignmentReqWithDescription,
  validCreationRequest,
  creationReqWithTaskId,
  creationReqWithoutUserId,
  creationReqWithoutProposedDeadline,
  creationReqWithoutExtIssueId,
  creationReqWithDescription,
  invalidRequest,
  existingOldTaskRequestWithMultipleUsers,
};
