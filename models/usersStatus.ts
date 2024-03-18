import { userState } from "../constants/userStatus";
import firestore from "../utils/firestore";
import { getTomorrowTimeStamp } from "../utils/userStatus";
const userStatusModel = firestore.collection("userStatus");
const futureStatusModel = firestore.collection("futureStatus");
/**
 * @params userId {string} : id of the user
 * @returns {Promise<userStatusModel|Object>} : returns the userStatus of a single user
 */
export const getUserStatus = async (
  userId: string
): Promise<{ id: string; data: any; userStatusExists: boolean } | object> => {
  try {
    const userStatusDocs = await userStatusModel
      .where("userId", "==", userId)
      .where("state", "==", "CURRENT")
      .limit(1)
      .get();
    const [userStatusDoc] = userStatusDocs.docs;
    if (userStatusDoc) {
      const id = userStatusDoc.id;
      const data = userStatusDoc.data();
      return { id, data, userStatusExists: true };
    } else {
      return { id: null, data: null, userStatusExists: false };
    }
  } catch (error) {
    logger.error(`Error in fetching the User Status Document. Reason - ${error}`);
    throw error;
  }
};

const updateFutureStatus = async (userId: string, dataToAddInFutureStatus: any) => {
  const data: any = {
    userId,
    from: dataToAddInFutureStatus.appliedOn,
    status: dataToAddInFutureStatus.status,
    state: "UPCOMING",
    message: dataToAddInFutureStatus.message || "",
  };
  if (dataToAddInFutureStatus.status === userState.OOO) {
    data.endsOn = dataToAddInFutureStatus.endsOn;
  }
  const { id } = await futureStatusModel.add(dataToAddInFutureStatus);
  return { id, data, userStatusExists: undefined, futureStatus: true };
};

const updateCurrentStatus = async (userId: string, dataToAddInCurrentStatus: any) => {
  const userStatusDocs = await userStatusModel
    .where("userId", "==", userId)
    .where("state", "==", "CURRENT")
    .limit(1)
    .get();
  const [userStatusDoc] = userStatusDocs.docs;
  if (userStatusDoc) {
    const today = new Date();
    const todaysTime = Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      today.getUTCHours(),
      today.getUTCMinutes(),
      today.getUTCSeconds()
    );
    await userStatusModel.doc(userStatusDoc.id).set({ state: "PAST", endedOn: todaysTime }, { merge: true });
  }
  if (dataToAddInCurrentStatus.status === userState.OOO) {
    await futureStatusModel.add({
      userId,
      from: dataToAddInCurrentStatus.endsOn,
      status: userStatusDoc?.data()?.status || userState.IDLE,
      state: "UPCOMING",
      message: "",
    });
    delete dataToAddInCurrentStatus.endsOn;
  }
  const { id } = await userStatusModel.add({ userId, ...dataToAddInCurrentStatus });
  return { id, data: dataToAddInCurrentStatus, userStatusExists: !!userStatusDoc, futureStatus: false };
};

export const updateUserStatus = async (userId: string, statusData: any) => {
  try {
    const tomorrow = getTomorrowTimeStamp();
    if (statusData.appliedOn >= tomorrow) {
      return await updateFutureStatus(userId, statusData);
    } else {
      return await updateCurrentStatus(userId, statusData);
    }
  } catch (error) {
    logger.error(`Error in updating the User Status Document. Reason - ${error}`);
    throw error;
  }
};
