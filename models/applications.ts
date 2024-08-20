import { application } from "../types/application";
const firestore = require("../utils/firestore");
const ApplicationsModel = firestore.collection("applicants");
const { DOCUMENT_WRITE_SIZE: FIRESTORE_BATCH_OPERATIONS_LIMIT } = require("../constants/constants");
import { chunks } from "../utils/array";

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
  // Hot-fix: Sorting by userId due to missing created field in some entries. 
  // Revert to createdAt once the field is updated.
  // https://github.com/Real-Dev-Squad/website-backend/issues/2084
    let dbQuery = ApplicationsModel.orderBy("userId", "desc");

    if (lastDoc) {
      dbQuery = dbQuery.startAfter(lastDoc);
    }

    const applications = await dbQuery.limit(limit).get();

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

const getApplicationsBasedOnStatus = async (status: string, limit: number, lastDocId?: string, userId?: string) => {
  try {
    let lastDoc = null;
    const applications = [];
    let dbQuery = ApplicationsModel.where("status", "==", status);

    if (userId) {
      dbQuery = dbQuery.where("userId", "==", userId);
    }

    if (lastDocId) {
      lastDoc = await ApplicationsModel.doc(lastDocId).get();
    }

  // Hot-fix: Sorting by userId due to missing created field in some entries. 
  // Revert to createdAt once the field is updated.
  // https://github.com/Real-Dev-Squad/website-backend/issues/2084
  dbQuery = dbQuery.orderBy("userId", "desc");

    if (lastDoc) {
      dbQuery = dbQuery.startAfter(lastDoc);
    }

    const applicationsBasedOnStatus = await dbQuery.limit(limit).get();

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

const updateApplicantsStatus = async () => {
  try {
    const operationStats = {
      failedApplicantUpdateIds: [],
      totalFailedApplicantUpdates: 0,
      totalApplicantUpdates: 0,
    };

    const updatedApplicants = [];
    const applicantsSnapshot = await ApplicationsModel.get();

    if (applicantsSnapshot.empty) {
      return operationStats;
    }

    operationStats.totalApplicantUpdates = applicantsSnapshot.size;

    applicantsSnapshot.forEach((applicant) => {
      const applicantData = applicant.data();
      if (!applicantData.hasOwnProperty("status")) {
        applicantData.status = "pending";
        updatedApplicants.push({ id: applicant.id, data: applicantData });
      }
    });

    const multipleApplicantUpdateBatch = [];
    const chunkedApplicants = chunks(updatedApplicants, DOCUMENT_WRITE_SIZE);

    for (const applicants of chunkedApplicants) {
      const batch = firestore().batch();
      applicants.forEach(({ id, data }) => {
        batch.update(firestore().collection("applicants").doc(id), data);
      });

      try {
        await batch.commit();
        multipleApplicantUpdateBatch.push(batch);
      } catch (error) {
        operationStats.totalFailedApplicantUpdates += applicants.length;
        applicants.forEach(({ id }) => operationStats.failedApplicantUpdateIds.push(id));
      }
    }

    await Promise.allSettled(multipleApplicantUpdateBatch);
    return operationStats;
  } catch (err) {
    logger.error("Error in batch update", err);
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
  updateApplicantsStatus
};
