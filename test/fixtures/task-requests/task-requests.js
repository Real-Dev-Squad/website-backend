const validAssignmentRequest = {
  taskId: "1234",
  externalIssueId: "5678",
  requestType: "ASSIGNMENT",
  userId: "7890",
  proposedDeadline: 1243455234,
};

const { taskId: tarTaskId, ...assignmentReqWithoutTaskId } = validAssignmentRequest;

const { userId: tarUserId, ...assignmentReqWithoutUserId } = validAssignmentRequest;

const { proposedDeadline: tarProposedDeadline, ...assignmentReqWithoutProposedDeadline } = validAssignmentRequest;

const { externalIssueId: tarExternalIssueId, ...assignmentReqWithoutExtIssueId } = validAssignmentRequest;

const assignmentReqWithDescription = { ...validAssignmentRequest, description: "something something" };

const validCreationRequest = {
  externalIssueId: "5678",
  requestType: "CREATION",
  userId: "7890",
  proposedDeadline: 1243455234,
};

const creationReqWithTaskId = { ...validCreationRequest, taskId: "1234" };

const { userId: tcrUserId, ...creationReqWithoutUserId } = validCreationRequest;

const { proposedDeadline: tcrProposedDeadline, ...creationReqWithoutProposedDeadline } = validCreationRequest;

const { externalIssueId: tcrExternalIssueId, ...creationReqWithoutExtIssueId } = validCreationRequest;

const creationReqWithDescription = { ...validCreationRequest, description: "something something" };

const invalidRequest = {
  hello: "world",
};

module.exports = {
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
};
