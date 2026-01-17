const { Conflict, NotFound } = require("http-errors");
const fireStore = require("../utils/firestore");
const progressesCollection = fireStore.collection("progresses");
const { PROGRESSES_RESPONSE_MESSAGES, TYPE_MAP } = require("../constants/progresses");
const {
  buildQueryToFetchDocs,
  getProgressDocs,
  buildRangeProgressQuery,
  getProgressRecords,
  assertUserOrTaskExists,
  buildQueryForPostingProgress,
  assertTaskExists,
  getProgressDateTimestamp,
  buildQueryToSearchProgressByDay,
  buildQueryToFetchPaginatedDocs,
  getPaginatedProgressDocs,
} = require("../utils/progresses");
const { retrieveUsers } = require("../services/dataAccessLayer");
const { PROGRESS_ALREADY_CREATED, PROGRESS_DOCUMENT_NOT_FOUND } = PROGRESSES_RESPONSE_MESSAGES;

/**
 * Adds a new progress document for the given user or task, with a limit of one progress document per day.
 * @param progressData {object} The data to be added. It should be an object containing key-value pairs of the fields to be added, including a "type" field set to either "user" or "task".
 * @returns {Promise<object>} A Promise that resolves with the added progress document object, or rejects with an error object if the add operation fails.
 * @throws {Error} If a progress document has already been created for the given user or task on the current day.
 **/
const createProgressDocument = async (progressData) => {
  const { type, taskId } = progressData;
  const createdAtTimestamp = new Date().getTime();
  const progressDateTimestamp = getProgressDateTimestamp();
  let taskTitle;
  if (taskId) {
    taskTitle = await assertTaskExists(taskId);
  }
  const query = buildQueryForPostingProgress(progressData);
  const existingDocumentSnapshot = await query.where("date", "==", progressDateTimestamp).get();
  if (!existingDocumentSnapshot.empty) {
    throw new Conflict(`${type.charAt(0).toUpperCase() + type.slice(1)} ${PROGRESS_ALREADY_CREATED}`);
  }
  const progressDocumentData = { ...progressData, createdAt: createdAtTimestamp, date: progressDateTimestamp };
  const { id } = await progressesCollection.add(progressDocumentData);
  const data = { id, ...progressDocumentData };
  return { data, taskTitle };
};

/**
 * This function retrieves the progress document for a specific user or task, or for all users or all tasks if no specific user or task is provided.
 * @param queryParams {object} This is the data that will be used for querying. It should be an object that includes key-value pairs for the fields - type, userId, taskId.
 * @returns {Promise<object>} A Promise that resolves with the progress document objects.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
const getProgressDocument = async (queryParams) => {
  await assertUserOrTaskExists(queryParams);
  const query = buildQueryToFetchDocs(queryParams);
  const progressDocs = await getProgressDocs(query);

  return await addUserDetailsToProgressDocs(progressDocs);
};

/**
 * Retrieves a paginated list of progress documents based on the provided query parameters.
 * @param {object} queryParams - Query data, including type, userId, taskId, and optional pagination details (page and pageSize).
 * @returns {Promise<object>} Resolves with paginated progress documents.
 * @throws {Error} If userId or taskId is invalid or not found.
 **/

const getPaginatedProgressDocument = async (queryParams) => {
  await assertUserOrTaskExists(queryParams);
  const page = queryParams.page || 0;
  const { baseQuery, totalProgressCount } = await buildQueryToFetchPaginatedDocs(queryParams);

  let progressDocs = await getPaginatedProgressDocs(baseQuery, page);
  progressDocs = await addUserDetailsToProgressDocs(progressDocs);
  return { progressDocs, totalProgressCount };
};
/**
 * This function fetches the progress records for a particular user or task within the specified date range, from start to end date.
 * @param queryParams {object} This is the data that will be used for querying. It should be an object that includes key-value pairs for the fields - userId, taskId, startDate, and endDate.
 * @returns {Promise<object>} A Promise that resolves with the progress records of the queried user or task.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
const getRangeProgressData = async (queryParams) => {
  const { startDate, endDate } = queryParams;
  await assertUserOrTaskExists(queryParams);
  const query = buildRangeProgressQuery(queryParams);
  const progressRecords = await getProgressRecords(query, queryParams);
  return {
    startDate,
    endDate,
    progressRecords,
  };
};

/**
 * This function fetches the progress records for a particular user or task on the specified date.
 * @param pathParams {object} This is the data that will be used for querying the db. It should contain type, typeId and date
 * @returns {Promise<object>} A Promise that resolves with the progress records of the queried user or task.
 * @throws {Error} If the userId or taskId is invalid or does not exist.
 **/
async function getProgressByDate(pathParams, queryParams) {
  const { type, typeId, date } = pathParams;
  const { dev } = queryParams;
  /* eslint-disable security/detect-object-injection */
  await assertUserOrTaskExists({ [TYPE_MAP[type]]: typeId });
  const query = buildQueryToSearchProgressByDay({ [TYPE_MAP[type]]: typeId, date });
  /* eslint-enable security/detect-object-injection */
  const result = await query.get();
  if (!result.size) {
    throw new NotFound(PROGRESS_DOCUMENT_NOT_FOUND);
  }
  const doc = result.docs[0];
  const docData = doc.data();
  if (dev === "true") {
    const { user: userData } = await retrieveUsers({ id: docData.userId });
    return { id: doc.id, ...docData, userData };
  }

  return { id: doc.id, ...docData };
}

/**
 * Adds user details to progress documents by fetching unique users.
 * This function retrieves user details for each user ID in the progress documents and attaches the user data to each document.
 *
 * @param {Array<object>} progressDocs - An array of progress documents. Each document should include a `userId` property.
 * @returns {Promise<Array<object>>} A Promise that resolves to an array of progress documents with the `userData` field populated.
 *                                   If an error occurs while fetching the user details, the `userData` field will be set to `null` for each document.
 */
const addUserDetailsToProgressDocs = async (progressDocs) => {
  try {
    const uniqueUserIds = [...new Set(progressDocs.map((doc) => doc.userId))];

    const uniqueUsersData = await retrieveUsers({
      userIds: uniqueUserIds,
    });
    const allUsers = uniqueUsersData.flat();
    const userByIdMap = allUsers.reduce((lookup, user) => {
      if (user) lookup[user.id] = user;
      return lookup;
    }, {});

    return progressDocs.map((doc) => {
      const userDetails = userByIdMap[doc.userId] || null;
      return { ...doc, userData: userDetails };
    });
  } catch (err) {
    return progressDocs.map((doc) => ({ ...doc, userData: null }));
  }
};

/**
 * Creates multiple progress documents in a batch operation.
 * @param {Array<Object>} progressDataArray - Array of progress data objects to create.
 * @returns {Promise<Object>} A Promise that resolves with the result of the batch operation,
 *                           including counts of successful and failed operations and details of each.
 */
const createBulkProgressDocuments = async (progressDataArray) => {
  const batch = fireStore.batch();
  const createdAtTimestamp = new Date().getTime();
  const progressDateTimestamp = getProgressDateTimestamp();
  
  const result = {
    successCount: 0,
    failureCount: 0,
    successfulRecords: [],
    failedRecords: []
  };
  
  // First, check for existing progress documents for the current day
  const existingProgressChecks = await Promise.all(
    progressDataArray.map(async (progressData) => {
      try {
        const { type, taskId, userId } = progressData;
        
        // Validate task exists if taskId is provided
        if (taskId) {
          await assertTaskExists(taskId);
        }
        
        // Check if progress already exists for today
        const query = buildQueryForPostingProgress(progressData);
        const existingDocumentSnapshot = await query.where("date", "==", progressDateTimestamp).get();
        
        return {
          progressData,
          exists: !existingDocumentSnapshot.empty,
          error: existingDocumentSnapshot.empty ? null : `${type.charAt(0).toUpperCase() + type.slice(1)} ${PROGRESS_ALREADY_CREATED}`
        };
      } catch (error) {
        return {
          progressData,
          exists: false,
          error: error.message
        };
      }
    })
  );
  
  // Process records that don't have existing progress for today
  existingProgressChecks.forEach((check) => {
    if (check.error) {
      result.failureCount++;
      result.failedRecords.push({
        record: check.progressData,
        error: check.error
      });
    } else {
      // Add to batch
      const progressDocumentData = { 
        ...check.progressData, 
        createdAt: createdAtTimestamp, 
        date: progressDateTimestamp 
      };
      
      const docRef = progressesCollection.doc();
      batch.set(docRef, progressDocumentData);
      
      result.successCount++;
      result.successfulRecords.push({
        id: docRef.id,
        ...progressDocumentData
      });
    }
  });
  
  // Commit the batch if there are any successful records
  if (result.successCount > 0) {
    await batch.commit();
  }
  
  return result;
};

module.exports = {
  createProgressDocument,
  getProgressDocument,
  getPaginatedProgressDocument,
  getRangeProgressData,
  getProgressByDate,
  addUserDetailsToProgressDocs,
  createBulkProgressDocuments,
};
