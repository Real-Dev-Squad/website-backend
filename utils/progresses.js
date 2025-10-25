const { NotFound } = require("http-errors");
const { fetchTask } = require("../models/tasks");
const { fetchUser } = require("../models/users");
const fireStore = require("../utils/firestore");
const progressesModel = fireStore.collection("progresses");

const {
  PROGRESSES_RESPONSE_MESSAGES: { PROGRESS_DOCUMENT_NOT_FOUND },
  MILLISECONDS_IN_DAY,
  PROGRESS_VALID_SORT_FIELDS,
  PROGRESSES_PAGE_SIZE,
  PROGRESSES_SIZE,
} = require("../constants/progresses");
const { convertTimestampToUTCStartOrEndOfDay } = require("./time");
const progressesCollection = fireStore.collection("progresses");

/**
 * Returns the progress date timestamp
 *
 * @returns {Date} A date object representing the current time in IST Timezone
 */
const getProgressDateTimestamp = () => {
  // Currently, we are primarily catering to Indian users for our apps, which is why we have implemented support for the IST (Indian Standard Time) timezone for progress updates.
  const currentHourIST = new Date().getUTCHours() + 5.5; // IST offset is UTC+5:30;
  const isBefore6amIST = currentHourIST === 5.5 && new Date().getUTCMinutes() <= 30;
  return isBefore6amIST ? new Date().setUTCHours(0, 0, 0, 0) - MILLISECONDS_IN_DAY : new Date().setUTCHours(0, 0, 0, 0);
};

/**
 * Builds a Firestore query for posting progress documents based on the given parameters.
 *
 * @param {Object} params - An object containing the parameters for the query.
 * @param {string} params.type - The type of query to build, either "user" or "task".
 * @param {string} params.userId - The ID of the user to filter progress documents by, if `type` is "user".
 * @param {string} params.taskId - The ID of the task to filter progress documents by, if `type` is "task".
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 */
const buildQueryForPostingProgress = ({ type, userId, taskId }) => {
  const query =
    type === "user"
      ? progressesCollection.where("type", "==", "user").where("userId", "==", userId)
      : progressesCollection.where("type", "==", "task").where("taskId", "==", taskId);
  return query;
};

/**
 * Checks if a user with a given ID exists in the system.
 *
 * @async
 * @param {string} userId - The ID of the user to check for existence.
 * @throws {NotFound} If the user with the given ID does not exist.
 * @returns {Promise<void>} A promise that resolves if the user exists and rejects with a `NotFound` error if the user does not exist.
 */
const assertUserExists = async (userId) => {
  const { userExists } = await fetchUser({ userId });
  if (!userExists) {
    throw new NotFound(`User with id ${userId} does not exist.`);
  }
};

/**
 * Checks if a user with a given ID exists in the system.
 *
 * @async
 * @param {string} taskData - The ID of the task to check for existence.
 * @throws {NotFound} If the task with the given ID does not exist.
 * @returns {Promise<void>} A promise that resolves if the task exists and rejects with a `NotFound` error if the task does not exist.
 */
const assertTaskExists = async (taskId) => {
  const { taskData } = await fetchTask(taskId);
  if (!taskData) {
    throw new NotFound(`Task with id ${taskId} does not exist.`);
  }
  return taskData.title;
};

/**
 * Checks if a user or task with the given ID exists in the system.
 *
 * @async
 * @param {Object} queryParams - An object containing the query parameters.
 * @param {string} [queryParams.userId] - (Optional) The ID of the user to check for existence.
 * @param {string} [queryParams.taskId] - (Optional) The ID of the task to check for existence.
 * @throws {NotFound} If neither a user nor a task with the given ID exists in the system.
 * @returns {Promise<void>} A promise that resolves if either the user or the task exists and rejects with a `NotFound` error if neither exists.
 */
const assertUserOrTaskExists = async (queryParams) => {
  const { userId, taskId } = queryParams;
  if (userId) {
    await assertUserExists(userId);
  } else if (taskId) {
    await assertTaskExists(taskId);
  }
};

/**
 * Builds a Firestore query for retrieving progress documents within a date range and optionally filtered by user ID or task ID.
 * @param {Object} queryParams - An object containing the query parameters.
 * @param {string} queryParams.userId - (Optional) The user ID to filter progress documents by.
 * @param {string} queryParams.taskId - (Optional) The task ID to filter progress documents by.
 * @param {string} queryParams.type - (Optional) The type to filter progress documents by.
 * @param {string} queryParams.orderBy - (Optional) The type to sort the documents.
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 */
const buildQueryToFetchDocs = (queryParams) => {
  const { type, userId, taskId, orderBy } = queryParams;
  const orderByField = PROGRESS_VALID_SORT_FIELDS[0];
  const isAscOrDsc = orderBy && PROGRESS_VALID_SORT_FIELDS[0] === orderBy ? "asc" : "desc";

  if (type) {
    return progressesCollection.where("type", "==", type).orderBy(orderByField, isAscOrDsc);
  } else if (userId) {
    return progressesCollection
      .where("type", "==", "user")
      .where("userId", "==", userId)
      .orderBy(orderByField, isAscOrDsc);
  } else {
    return progressesCollection
      .where("type", "==", "task")
      .where("taskId", "==", taskId)
      .orderBy(orderByField, isAscOrDsc);
  }
};

/**
 * Builds a Firestore query to retrieve a paginated list of progress documents within a date range,
 * optionally filtered by user ID, task ID, type, and sorted by a specific field.
 * @param {Object} queryParams - Query parameters including userId, taskId, type, orderBy, size, and page.
 * @returns {Query} A Firestore query object for filtered and paginated progress documents.
 */

const buildQueryToFetchPaginatedDocs = async (queryParams) => {
  const { type, userId, taskId, orderBy, size = PROGRESSES_SIZE, page = PROGRESSES_PAGE_SIZE } = queryParams;
  const orderByField = PROGRESS_VALID_SORT_FIELDS[0];
  const isAscOrDsc = orderBy && PROGRESS_VALID_SORT_FIELDS[0] === orderBy ? "asc" : "desc";
  const limit = parseInt(size, 10);
  const offset = parseInt(page, 10) * limit;

  let baseQuery;
  if (type) {
    baseQuery = progressesCollection.where("type", "==", type).orderBy(orderByField, isAscOrDsc);
  } else if (userId) {
    baseQuery = progressesCollection
      .where("type", "==", "user")
      .where("userId", "==", userId)
      .orderBy(orderByField, isAscOrDsc);
  } else {
    baseQuery = progressesCollection
      .where("type", "==", "task")
      .where("taskId", "==", taskId)
      .orderBy(orderByField, isAscOrDsc);
  }

  const totalProgress = await baseQuery.get();
  const totalProgressCount = totalProgress.size;

  baseQuery = baseQuery.limit(limit).offset(offset);
  return { baseQuery, totalProgressCount };
};

/**
 * Retrieves progress documents from Firestore based on the given query.
 * @param {Query} query - A Firestore query object for fetching progress documents.
 * @returns {Array.<Object>} An array of objects representing the retrieved progress documents. Each object contains the document ID and its data.
 * @throws {NotFound} If no progress documents are found based on the given query.
 */
const getProgressDocs = async (query) => {
  const progressesDocs = await query.get();
  if (!progressesDocs.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  const docsData = [];
  progressesDocs.forEach((doc) => {
    docsData.push({ id: doc.id, ...doc.data() });
  });
  return docsData;
};
/**
 * Retrieves progress documents from Firestore based on the given query and page number.
 *
 * @param {Query} query - A Firestore query object for fetching progress documents.
 * @param {number} [pageNumber] - The current page number (optional). If not provided, it will check for documents without pagination.
 * @returns {Array.<Object>} An array of objects representing the retrieved progress documents.
 * Each object contains the document ID (`id`) and its associated data.
 *
 * @throws {NotFound} If no progress documents are found and no page number is specified.
 */
const getPaginatedProgressDocs = async (query, page) => {
  const progressesDocs = await query.get();
  if (!page && !progressesDocs.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  if (!progressesDocs.size) {
    return [];
  }
  const docsData = [];
  progressesDocs.forEach((doc) => {
    docsData.push({ id: doc.id, ...doc.data() });
  });
  return docsData;
};

/**
 * Builds a Firestore query for retrieving progress documents within a date range and optionally filtered by user ID or task ID.
 * @param {Object} queryParams - An object containing the query parameters.
 * @param {string} queryParams.userId - (Optional) The user ID to filter progress documents by.
 * @param {string} queryParams.taskId - (Optional) The task ID to filter progress documents by.
 * @param {string} queryParams.startDate - The start date of the date range (inclusive). Should be in ISO format (e.g. "2023-05-11").
 * @param {string} queryParams.endDate - The end date of the date range (inclusive). Should be in ISO format (e.g. "2023-05-11").
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 * @throws {Error} If neither userId nor taskId is provided in the queryParams object.
 */
const buildRangeProgressQuery = (queryParams) => {
  const { userId, taskId, startDate, endDate } = queryParams;
  let query = progressesCollection;
  if (userId) {
    query = query.where("type", "==", "user").where("userId", "==", userId);
  } else if (taskId) {
    query = query.where("type", "==", "task").where("taskId", "==", taskId);
  } else {
    throw new Error("Either userId or taskId is required.");
  }
  const startDateTimestamp = Date.parse(startDate);
  const endDateTimestamp = Date.parse(endDate);
  query = query.where("date", ">=", startDateTimestamp).where("date", "<=", endDateTimestamp);
  return query;
};
/**
 * Retrieves progress records for a given date range.
 * @param {QuerySnapshot} query - A reference to the query for fetching progress documents.
 * @param {Object} queryParams - An object containing the start and end date for the date range.
 * @param {string} queryParams.startDate - The start date of the date range (inclusive).
 * @param {string} queryParams.endDate - The end date of the date range (inclusive).
 * @returns {Object.<string, boolean>} An object where each key represents a date between the start and end date, and the value for each key represents whether a progress document exists for that date or not.
 */
const getProgressRecords = async (query, queryParams) => {
  const { startDate, endDate } = queryParams;
  const docsData = {};
  const queryResult = await query.get();
  if (!queryResult.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  const progressesDocs = queryResult.docs;
  progressesDocs.forEach((doc) => {
    const date = new Date(doc.data().date).toISOString().slice(0, 10);
    // Validate that date is in YYYY-MM-DD format (e.g., "2023-05-09")
    // ^ = start of string, \d{4} = exactly 4 digits, - = literal dash, \d{2} = exactly 2 digits, $ = end of string
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Object.defineProperty(docsData, date, {
        value: true,
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
  });

  const progressRecords = {};
  const currentDate = new Date(startDate);
  while (currentDate <= new Date(endDate)) {
    const date = currentDate.toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const hasProgress = Object.prototype.hasOwnProperty.call(docsData, date) ? Reflect.get(docsData, date) : false;
      Object.defineProperty(progressRecords, date, {
        value: Boolean(hasProgress),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return progressRecords;
};

/**
 * Retrieves progress records for a given date range.
 * @param {Object} pathParamsObject - An object containing the type , typeId and date.
 * @param {string} pathParamsObject.type - The type of the record i.e user or task.
 * @param {string} pathParamsObject.typeId - The id of the type i.e user or task.
 * @param {string} pathParamsObject.date - The date of the record
 * @returns {Query} A Firestore query object that filters progress documents based on the given parameters.
 *
 */
const buildQueryToSearchProgressByDay = (pathParams) => {
  const { userId, taskId, date } = pathParams;
  let query = progressesCollection;
  if (userId) {
    query = query.where("type", "==", "user").where("userId", "==", userId);
  } else {
    query = query.where("type", "==", "task").where("taskId", "==", taskId);
  }
  const dateTimeStamp = new Date(date).setUTCHours(0, 0, 0, 0);
  query = query.where("date", "==", dateTimeStamp).limit(1);
  return query;
};

const buildProgressQueryForMissedUpdates = (taskId, startTimestamp, endTimestamp) => {
  return progressesModel
    .where("type", "==", "task")
    .where("taskId", "==", taskId)
    .where("date", ">=", convertTimestampToUTCStartOrEndOfDay(startTimestamp))
    .where("date", "<=", convertTimestampToUTCStartOrEndOfDay(endTimestamp, true))
    .count();
};
module.exports = {
  getProgressDateTimestamp,
  buildQueryForPostingProgress,
  assertUserExists,
  assertTaskExists,
  assertUserOrTaskExists,
  buildQueryToFetchDocs,
  getProgressDocs,
  getPaginatedProgressDocs,
  buildRangeProgressQuery,
  getProgressRecords,
  buildQueryToSearchProgressByDay,
  buildProgressQueryForMissedUpdates,
  buildQueryToFetchPaginatedDocs,
};
