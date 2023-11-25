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

const getUserApplications = async (userId: string) => {
  try {
    const application = await ApplicationsModel.where("userId", "==", userId).limit(1).get();
    const [applicationDoc] = application.docs;
    if (applicationDoc) {
      return { id: applicationDoc.id, ...applicationDoc.data() };
    }
    return { notFound: true }
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
};
