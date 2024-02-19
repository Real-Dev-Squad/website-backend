import firestore from "../utils/firestore";
const userStatusModel = firestore.collection("userStatus");
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
    const userStatusDocs = await userStatusModel
      .where("userId", "==", userId)
      .where("state", "==", "CURRENT")
      .limit(1)
      .get();
    const [userStatusDoc] = userStatusDocs.docs;
    if (userStatusDoc) {
      await userStatusModel.doc(userStatusDoc.id).set({ state: "PAST" }, { merge: true });
    }
    const { id } = await userStatusModel.add({ userId, ...updatedStatusData });
    return { id, userId, data: updatedStatusData };
  } catch (error) {
    logger.error(`Error in updating the User Status Document. Reason - ${error}`);
    throw error;
  }
};
