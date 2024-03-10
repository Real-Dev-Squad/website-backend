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

export const updateUserStatus = async (userId: string, updatedStatusData: any) => {
  try {
    const tomorrow = getTomorrowTimeStamp();
    if (updatedStatusData.appliedOn >= tomorrow) {
      const { id } = await futureStatusModel.add({
        userId,
        from: updatedStatusData.appliedOn,
        status: updatedStatusData.status,
        state: "UPCOMING",
        endsOn: updatedStatusData.endsOn,
        message: updatedStatusData.message,
      });
      return { id, userId, data: updatedStatusData, futureStatus: true };
    } else {
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
      if(updatedStatusData.status === userState.OOO) {
        await futureStatusModel.add({
          userId,
          from: updatedStatusData.endsOn,
          status: userStatusDoc?.data()?.status || userState.IDLE,
          state: "UPCOMING",
          message: "",
        });
        delete updatedStatusData.endsOn;
      }
      const { id } = await userStatusModel.add({ userId, ...updatedStatusData });
      return { id, userId, data: updatedStatusData, userStatusExists: !!userStatusDoc, futureStatus: false };
    }
  } catch (error) {
    logger.error(`Error in updating the User Status Document. Reason - ${error}`);
    throw error;
  }
};