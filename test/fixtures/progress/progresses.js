export const standupProgressDay1 = {
  type: "user",
  completed: "Working on a backend Go project",
  planned: "Implement error handling for API endpoints",
  blockers: "Waiting for database access credentials",
};

export const incompleteProgress = [
  {
    missingField: "type",
    payload: {
      completed: "Implemented caching mechanism for frequent API requests",
      planned: "Refactor code to follow coding best practices",
      blockers: "Waiting for feedback from the code review",
    },
  },
  {
    missingField: "completed",
    payload: {
      type: "user",
      planned: "Refactor code to follow coding best practices",
      blockers: "Waiting for feedback from the code review",
    },
  },
  {
    missingField: "planned",
    payload: {
      type: "user",
      completed: "Implemented caching mechanism for frequent API requests",
      blockers: "Waiting for feedback from the code review",
    },
  },
  {
    missingField: "blockers",
    payload: {
      type: "user",
      completed: "Implemented caching mechanism for frequent API requests",
      planned: "Refactor code to follow coding best practices",
    },
  },
];

export const stubbedModelProgressData = (userId, createdAt, date) => {
  return {
    userId,
    createdAt,
    date,
    type: "user",
    completed: "Implemented caching mechanism for frequent API requests",
    planned: "Refactor code to follow coding best practices",
    blockers: "Waiting for feedback from the code review",
  };
};

export const taskProgressDay1 = (taskId) => {
  return {
    taskId,
    type: "task",
    completed: "Working on a backend Go Task",
    planned: "Implement error handling for API endpoints",
    blockers: "Waiting for database access credentials",
  };
};

export const incompleteTaskProgress = (taskId) => [
  {
    missingField: "type",
    payload: {
      taskId,
      completed: "Implemented caching mechanism for frequent API requests",
      planned: "Refactor code to follow coding best practices",
      blockers: "Waiting for feedback from the code review",
    },
  },
  {
    missingField: "completed",
    payload: {
      taskId,
      type: "task",
      planned: "Refactor code to follow coding best practices",
      blockers: "Waiting for feedback from the code review",
    },
  },
  {
    missingField: "planned",
    payload: {
      taskId,
      type: "task",
      completed: "Implemented caching mechanism for frequent API requests",
      blockers: "Waiting for feedback from the code review",
    },
  },
  {
    missingField: "blockers",
    payload: {
      taskId,
      type: "task",
      completed: "Implemented caching mechanism for frequent API requests",
      planned: "Refactor code to follow coding best practices",
    },
  },
  {
    missingField: "taskId",
    payload: {
      type: "task",
      completed: "Implemented caching mechanism for frequent API requests",
      planned: "Refactor code to follow coding best practices",
      blockers: "Waiting for feedback from the code review",
    },
  },
];

export const stubbedModelTaskProgressData = (userId, taskId, createdAt, date) => {
  return {
    userId,
    taskId,
    createdAt,
    date,
    type: "task",
    completed: "Implemented caching mechanism for frequent API requests",
    planned: "Refactor code to follow coding best practices",
    blockers: "Waiting for feedback from the code review",
  };
};
