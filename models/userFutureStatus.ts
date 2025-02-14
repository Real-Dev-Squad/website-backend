import firestore from "../utils/firestore";
const userFutureStatusModel = firestore.collection("userFutureStatus");
import { UserFutureStatusType } from "../types/userFutureStatus";
import * as admin from "firebase-admin";
import { logger } from "../utils/logger";

/**
 * Function to create user future status
 * @param body: UserFutureStatusType
 * @returns UserFutureStatusType
 */
export const createUserFutureStatus = async (body: UserFutureStatusType) => {
  try {
    const statusBody: UserFutureStatusType = {
      createdAt: Date.now(),
      ...body,
    };
    const resultDoc = await userFutureStatusModel.add(statusBody);
    return {
      id: resultDoc.id,
      ...body,
    };
  } catch (error) {
    logger.error("Error while creating user future status", error);
    throw error;
  }
};

/**
 * Function to get user future status
 * @param: id: string, status: string, state: string
 * @returns Array of user future status
 **/
export const getUserFutureStatus = async (userId: string, status: string, state: string) => {
  try {
    let resultArray = [];
    let query: admin.firestore.Query = userFutureStatusModel;

    if (userId) {
      query = query.where("userId", "==", userId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }
    if (state) {
      query = query.where("state", "==", state);
    }
    const resultDoc = await query.get();
    resultDoc.forEach((doc) => {
      resultArray.push({ id: doc.id, ...doc.data() });
    });
    return resultArray;
  } catch (error) {
    logger.error("Error while fetching user future status", error);
    throw error;
  }
};