import { application } from "../types/application";
import { chunks } from "../utils/array";
const firestore = require("../utils/firestore");
const ApplicationsModel = firestore.collection("applicants");
const { DOCUMENT_WRITE_SIZE: FIRESTORE_BATCH_OPERATIONS_LIMIT } = require("../constants/constants");

const batchUpdateApplications = async () => {
  try {
    const operationStats = {
      failedApplicationUpdateIds: [],
      totalFailedApplicationUpdates: 0,
      totalApplicationUpdates: 0,
    };

    const updatedApplications = [];
    const applications = await ApplicationsModel.get();

    if (applications.empty) {
      return operationStats;
    }

    operationStats.totalApplicationUpdates = applications.size;

    applications.forEach((application) => {
      const taskData = application.data();
      taskData.createdAt = null;
      updatedApplications.push({ id: application.id, data: taskData });
    });

    const multipleApplicationUpdateBatch = [];
    const chunkedApplication = chunks(updatedApplications, FIRESTORE_BATCH_OPERATIONS_LIMIT);
    console.log(chunkedApplication, 'applications')

    chunkedApplication.forEach(async (applications) => {
      const batch = firestore.batch();
      applications.forEach(({ id, data }) => {
        batch.update(ApplicationsModel.doc(id), data);
      });
      try {
        await batch.commit();
        multipleApplicationUpdateBatch.push(batch);
      } catch (error) {
        operationStats.totalFailedApplicationUpdates += applications.length;
        applications.forEach(({ id }) => operationStats.failedApplicationUpdateIds.push(id));
      }
    });

    await Promise.allSettled(multipleApplicationUpdateBatch);
    return operationStats;
  } catch (err) {
    logger.log("Error in batch update", err);
    throw err;
  }
};

const getAllApplications = async (limit: number, lastDocId?: string) => {
  try {
    const allApplicationsData = [];
    let lastDoc = null;

    if (lastDocId) {
      lastDoc = await ApplicationsModel.doc(lastDocId).get();
    }

    const applications = await ApplicationsModel.orderBy("createdAt", "desc")
      .startAfter(lastDoc ?? "")
      .limit(limit)
      .get();

    const lastApplicationDoc = applications.docs[applications.docs.length - 1];

    applications.forEach((data: any) => {
      allApplicationsData.push({
        id: data.id,
        ...data.data(),
      });
    });

    return { applications: allApplicationsData, lastDocId: lastApplicationDoc?.id };
  } catch (err) {
    logger.log("error in getting all intros", err);
    throw err;
  }
};

const getApplicationById = async (applicationId: string) => {
  try {
    const application = await ApplicationsModel.doc(applicationId).get();

    if (application.exists) {
      return { id: application.id, ...application.data(), notFound: false };
    }

    return { notFound: true };
  } catch (err) {
    logger.log("error in getting application", err);
    throw err;
  }
};

const getApplicationsBasedOnStatus = async (status: string, limit: number, lastDoc?: string, userId?: string) => {
  try {
    const applications = [];
    let dbQuery = ApplicationsModel.where("status", "==", status);

    if (userId) {
      dbQuery = dbQuery.where("userId", "==", userId);
    }

    const applicationsBasedOnStatus = await dbQuery
      .orderBy("createdAt", "desc")
      .startAfter(lastDoc ?? "")
      .limit(limit)
      .get();

    const lastApplicationDoc = applicationsBasedOnStatus.docs[applicationsBasedOnStatus.docs.length - 1];

    applicationsBasedOnStatus.forEach((data: any) => {
      applications.push({
        id: data.id,
        ...data.data(),
      });
    });

    return { applications, lastDocId: lastApplicationDoc?.id };
  } catch (err) {
    logger.log("error in getting applications based on status", err);
    throw err;
  }
};

const getUserApplications = async (userId: string) => {
  try {
    const applicationsResult = [];
    const applications = await ApplicationsModel.where("userId", "==", userId).get();

    applications.forEach((application) => {
      applicationsResult.push({
        id: application.id,
        ...application.data(),
      });
    });
    return applicationsResult;
  } catch (err) {
    logger.log("error in getting user intro", err);
    throw err;
  }
};

const addApplication = async (data: application) => {
  try {
    const application = await ApplicationsModel.add(data);
    return application.id;
  } catch (err) {
    logger.error("Error in adding data", err);
    throw err;
  }
};

const updateApplication = async (dataToUpdate: object, applicationId: string) => {
  try {
    await ApplicationsModel.doc(applicationId).update(dataToUpdate);
  } catch (err) {
    logger.error("Error in updating intro", err);
    throw err;
  }
};

module.exports = {
  getAllApplications,
  getUserApplications,
  addApplication,
  updateApplication,
  getApplicationsBasedOnStatus,
  getApplicationById,
  batchUpdateApplications,
};
