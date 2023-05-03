const standupProgressDay1 = {
  type: "user",
  completed: "Working on a backend Go project",
  planned: "Implement error handling for API endpoints",
  blockers: "Waiting for database access credentials",
};

const standupProgressDay2 = {
  type: "user",
  completed: "Completed API integration for user authentication",
  planned: "Optimize database queries for improved performance",
  blockers: "None",
};

const incompleteProgress = [
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

const stubbedModelProgressData = (userId, createdAt, date) => {
  return [
    {
      userId,
      createdAt,
      date,
      type: "user",
      completed: "Implemented caching mechanism for frequent API requests",
      planned: "Refactor code to follow coding best practices",
      blockers: "Waiting for feedback from the code review",
    },
  ];
};

module.exports = { standupProgressDay1, standupProgressDay2, incompleteProgress, stubbedModelProgressData };
