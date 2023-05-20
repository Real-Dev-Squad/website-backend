const predefinedTrackedProgressDataForUser = {
  type: "user",
  currentlyTracked: true,
  frequency: 1,
  createdAt: "2023-05-20T03:49:20.298Z",
  updatedAt: "2023-05-20T03:49:20.298Z",
};

const predefinedTrackedProgressDataForTask = {
  type: "task",
  currentlyTracked: true,
  frequency: 4,
  createdAt: "2023-05-20T03:49:20.298Z",
  updatedAt: "2023-05-20T03:49:20.298Z",
};

const trackedProgressUserDataForPost = {
  type: "user",
  currentlyTracked: true,
};

const trackedProgressTaskDataForPost = {
  type: "task",
  currentlyTracked: true,
  frequency: 2,
};

const trackedProgressDataForPatch = {
  currentlyTracked: false,
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
