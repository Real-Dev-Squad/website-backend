import { userState } from "../constants/userStatus";
import firestore from "../utils/firestore";
import { getTomorrowTimeStamp } from "../utils/userStatus";
import admin from "firebase-admin";
const userStatusModel = firestore.collection("userStatus");
const futureStatusModel = firestore.collection("futureStatus");
const memberRoleModel = firestore.collection("member-group-roles");
const usersCollection = firestore.collection("users");
const discordRoleModel = firestore.collection("discord-roles");
// @ts-ignore
const DISCORD_BASE_URL = config.get("services.discordBot.baseUrl");
import { generateAuthTokenForCloudflare } from "../utils/discord-actions";

const getGroupRole = async (rolename: string) => {
  try {
    if (!rolename) return { roleExists: false };
    const data = await discordRoleModel.where("rolename", "==", rolename).limit(1).get();
    if (data.empty) {
      return {
        roleExists: false,
      };
    }
    return {
      roleExists: true,
      role: {
        id: data.docs[0].id,
        ...data.docs[0].data(),
      },
    };
  } catch (err) {
    // @ts-ignore
    logger.error("Error in getting role", err);
    throw err;
  }
};

const removeGroupIdleRoleFromDiscordUser = async (userId: string) => {
  try {
    const groupRoleObj = await getGroupRole("group-idle");
    if (groupRoleObj?.roleExists) {
      // @ts-expect-error
      const groupIdleRoleId = groupRoleObj.role.roleid;
      const user = await usersCollection.doc(userId).get();
      const discordId = user.data().discordId;
      if (discordId) {
        // Remove role from firestore collection
        const hasRole = await memberRoleModel
          .where("roleid", "==", groupIdleRoleId)
          .where("userid", "==", discordId)
          .limit(1)
          .get();
        if (!hasRole.empty) {
          const oldRole = [];
          hasRole.forEach((role) => oldRole.push({ id: role.id }));
          await memberRoleModel.doc(oldRole[0].id).delete();
        }

        const authToken = generateAuthTokenForCloudflare();
        await fetch(`${DISCORD_BASE_URL}/roles`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ userid: discordId, roleid: groupIdleRoleId }),
        });
      }
    }
  } catch (error) {
    // @ts-ignore
    logger.error(`error in removing group-idle role from discord user. Reason - ${error}`);
    throw error;
  }
};

const addGroupIdleRoleToDiscordUser = async (userId: string) => {
  try {
    const groupRoleObj = await getGroupRole("group-idle");
    if (groupRoleObj?.roleExists) {
      // @ts-expect-error
      const groupIdleRoleId = groupRoleObj.role.roleid;
      const user = await usersCollection.doc(userId).get();
      const discordId = user.data().discordId;
      if (discordId) {
        // Add role to firestore collection
        const alreadyHasRole = await memberRoleModel
          .where("roleid", "==", groupIdleRoleId)
          .where("userid", "==", discordId)
          .limit(1)
          .get();
        if (alreadyHasRole.empty) {
          await memberRoleModel.add({
            roleid: groupIdleRoleId,
            userid: discordId,
            date: admin.firestore.Timestamp.fromDate(new Date()),
          });
        }

        const authToken = generateAuthTokenForCloudflare();
        await fetch(`${DISCORD_BASE_URL}/roles/add`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ userid: discordId, roleid: groupIdleRoleId }),
        });
      }
    }
  } catch (error) {
    // @ts-ignore
    logger.error(`error in adding role to discord user. Reason - ${error}`);
    throw error;
  }
};

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
    // @ts-ignore
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
    // @ts-ignore
    logger.error(`Error in updating the User Status Document. Reason - ${error}`);
    throw error;
  }
};

/**
 * @param userId { String }: Id of the User
 * @param newStatusData { Object }: Data to be Updated
 * @returns Promise<userStatusModel|Object>
 */
// TODO: Fix this implementation
export const updateAllUserStatus = async () => {
  const summary = {
    usersCount: 0,
    oooUsersAltered: 0,
    oooUsersUnaltered: 0,
    nonOooUsersAltered: 0,
    nonOooUsersUnaltered: 0,
  };
  try {
    const userFutureStatusDocs = await futureStatusModel.where("state", "==", "UPCOMING").get();
    summary.usersCount = userFutureStatusDocs.size;
    const batch = firestore.batch();
    const today = new Date().getTime();
    userFutureStatusDocs.forEach(async (document) => {
      const doc = document.data();
      const docRef = document.ref;
      const userId = doc.userId;
      const userStatusDocs = await userStatusModel
        .where("userId", "==", userId)
        .where("state", "==", "CURRENT")
        .limit(1)
        .get();
      const userStatusDoc = userStatusDocs.docs[0]
      const userStatusRef = userStatusDoc.ref;
      const { status: futureStatus } = doc;
      const { status: currentStatus } = userStatusDoc.data();
      const newStatusData: any = {
        userId,
        state: "CURRENT",
        appliedOn: today,
        status: futureStatus
      };
      let toUpdate = false;
      if (today >= doc.from) {
        // OOO period is over and we need to update their current status
        toUpdate = !toUpdate;
        summary.oooUsersAltered++;
      } else {
        summary.oooUsersUnaltered++;
      }
      if (toUpdate) {
        if (futureStatus === userState.IDLE && currentStatus !== userState.IDLE) {
          await addGroupIdleRoleToDiscordUser(userId);
        } else if (currentStatus === userState.IDLE && futureStatus !== userState.IDLE) {
          await removeGroupIdleRoleFromDiscordUser(userId);
        }
        batch.set(docRef, newStatusData);
      }
    });
    // if (batch.count() > 100) {
    //   logger.info(
    //     `Warning: More than 100 User Status documents to update. The max limit permissible is 500. Refer https://github.com/Real-Dev-Squad/website-backend/issues/890 for more details.`
    //   );
    // }
    await batch.commit();
    return summary;
  } catch (error) {
    // @ts-ignore
    logger.error(`error in updating User Status Documents ${error}`);
    return { status: 500, message: "User Status couldn't be updated Successfully." };
  }
};