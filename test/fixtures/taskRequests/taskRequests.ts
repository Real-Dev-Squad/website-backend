import { REQUEST_STATE, REQUEST_TYPE } from "../../../constants/requests";
import { TASK_REQUEST_TYPE } from "../../../constants/taskRequests";

export const validTaskCreqtionRequest = {
  externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website-my/issues/599",
  externalIssueHtmlUrl: "https://github.com/Real-Dev-Squad/website-my/issues/599",
  userId: "iODXB6ns8jaZB9p0XlBw",
  requestType: TASK_REQUEST_TYPE.CREATION,
  proposedStartDate: 1718845551203,
  proposedDeadline: 1719450351203,
  description: "Task Create Description",
  markdownEnabled: true,
  state: REQUEST_STATE.PENDING,
  type: REQUEST_TYPE.TASK,
};

export const validTaskAssignmentRequest = {
  externalIssueUrl: "https://api.github.com/repos/Real-Dev-Squad/website-my/issues/599",
  externalIssueHtmlUrl: "https://github.com/Real-Dev-Squad/website-my/issues/599",
  taskId: "iODXB6ns8jaZB9p0XlBw",
  requestType: TASK_REQUEST_TYPE.ASSIGNMENT,
  proposedStartDate: 1718845551203,
  proposedDeadline: 1719450351203,
  description: "Task Create Description",
  markdownEnabled: true,
  state: REQUEST_STATE.PENDING,
  type: REQUEST_TYPE.TASK,
};
