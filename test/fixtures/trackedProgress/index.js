const predefinedTrackedProgressDataForUser = {
  type: "user",
  monitored: true,
  frequency: 1,
  createdAt: "2023-05-20T03:49:20.298Z",
  updatedAt: "2023-05-20T03:49:20.298Z",
};

const predefinedTrackedProgressDataForTask = {
  type: "task",
  monitored: true,
  frequency: 4,
  createdAt: "2023-05-20T03:49:20.298Z",
  updatedAt: "2023-05-20T03:49:20.298Z",
};

const trackedProgressUserDataForPost = {
  type: "user",
  monitored: true,
};

const trackedProgressTaskDataForPost = {
  type: "task",
  monitored: true,
  frequency: 2,
};

const trackedProgressDataForPatch = {
  monitored: false,
};

/**
 * Checks if the given value is a valid ISO string representation of a date.
 *
 * @param {string} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid ISO string, otherwise false.
 *
 */
const isISOString = (value) => {
  return new Date(value).toISOString() === value;
};

module.exports = {
  predefinedTrackedProgressDataForUser,
  predefinedTrackedProgressDataForTask,
  trackedProgressUserDataForPost,
  trackedProgressTaskDataForPost,
  trackedProgressDataForPatch,
  isISOString,
};
