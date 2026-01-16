import { application } from "../types/application";
const firestore = require("../utils/firestore");
const logger = require("../utils/logger");
const ApplicationsModel = firestore.collection("applicants");
const { APPLICATION_STATUS_TYPES } = require("../constants/application");
const { convertDaysToMilliseconds } = require("../utils/time");

const getAllApplications = async (limit: number, lastDocId?: string) => {
  try {
    const allApplicationsData = [];
    let lastDoc = null;

    if (lastDocId) {
      lastDoc = await ApplicationsModel.doc(lastDocId).get();
    }

    let dbQuery = ApplicationsModel.orderBy("createdAt", "desc");

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

    dbQuery = dbQuery.orderBy("createdAt", "desc");

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

    let countQuery = ApplicationsModel.where("status", "==", status);

    const totalApplications = await countQuery.get();
    const totalCount = totalApplications.size;

    return { applications, lastDocId: lastApplicationDoc?.id, totalCount };
  } catch (err) {
    logger.log("error in getting applications based on status", err);
    throw err;
  }
};

const getUserApplications = async (userId: string) => {
  try {
    const applicationsResult = [];
    const applications = await ApplicationsModel.where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

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

const nudgeApplication = async ({ applicationId, userId }: { applicationId: string; userId: string }) => {
  try {
    const currentTime = Date.now();
    const twentyFourHoursInMilliseconds = convertDaysToMilliseconds(1);

    const result = await firestore.runTransaction(async (transaction) => {
      const applicationRef = ApplicationsModel.doc(applicationId);
      const applicationDoc = await transaction.get(applicationRef);

      if (!applicationDoc.exists) {
        return { status: "notFound" };
      }

      const application = applicationDoc.data();

      if (application.userId !== userId) {
        return { status: "unauthorized" };
      }

      if (application.status !== APPLICATION_STATUS_TYPES.PENDING) {
        return { status: "notPending" };
      }

      const lastNudgeAt = application.lastNudgeAt;
      if (lastNudgeAt) {
        const lastNudgeTimestamp = new Date(lastNudgeAt).getTime();
        const timeDifference = currentTime - lastNudgeTimestamp;

        if (timeDifference <= twentyFourHoursInMilliseconds) {
          return { status: "tooSoon" };
        }
      }

      const currentNudgeCount = application.nudgeCount || 0;
      const updatedNudgeCount = currentNudgeCount + 1;
      const newLastNudgeAt = new Date(currentTime).toISOString();

      transaction.update(applicationRef, {
        nudgeCount: updatedNudgeCount,
        lastNudgeAt: newLastNudgeAt,
      });

      return {
        status: "success",
        nudgeCount: updatedNudgeCount,
        lastNudgeAt: newLastNudgeAt,
      };
    });

    return result;
  } catch (err) {
    logger.error("Error while nudging application", err);
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
  nudgeApplication,
};
