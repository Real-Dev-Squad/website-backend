export type TaskRequestType = {
  requestors?: string[];
  status?: string;
  taskTitle?: string;
  taskId?: string;
  externalIssueUrl?: string;
  requestType?: string;
  users?: UserType[];
  createdBy?: string;
  createdAt?: number;
  lastModifiedBy?: string;
  lastModifiedAt?: number;
};

export type UserType = {
  userId?: string;
  proposedDeadline?: number;
  proposedStartDate?: number;
  description?: string;
  status?: string;
};
