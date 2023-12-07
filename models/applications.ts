import { application } from "../types/application";
const firestore = require("../utils/firestore");
const ApplicationsModel = firestore.collection("applicants");

const getAllApplications = async () => {
  try {
    const allApplicationsData = [];
    const allApplications = await ApplicationsModel.get();
    allApplications.forEach((data: any) => {
      allApplicationsData.push({
        id: data.id,
        ...data.data(),
      });
    });
    return allApplicationsData;
  } catch (err) {
    logger.log("error in getting all intros", err);
    throw err;
  }
};

const getApplicationById = async (applicationId: string) => {
  const application = await ApplicationsModel.doc(applicationId).get();

  if (application.exists) {
    return { id: application.id, ...application.data(), notFound: false };
  }

  return { notFound: true };
};

const getApplicationsBasedOnStatus = async (status: string, userId: string) => {
  const applications = [];
  let dbQuery = ApplicationsModel.where("status", "==", status);

  if (userId) {
    dbQuery = dbQuery.where("userId", "==", userId);
  }
  const applicationsBasedOnStatus = await dbQuery.get();

  applicationsBasedOnStatus.forEach((data: any) => {
    applications.push({
      id: data.id,
      ...data.data(),
    });
  });

  return applications;
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
};
