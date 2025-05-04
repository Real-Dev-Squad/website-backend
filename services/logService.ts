import firestore from "../utils/firestore.js";
import admin from "firebase-admin";
import { INTERNAL_SERVER_ERROR } from "../constants/errorMessages.js";
import logger from "../utils/logger.js";

const logsModel = firestore.collection("logs");

interface LogMeta {
  userId?: string;
  [key: string]: number | string | object;
}

interface LogBody {
  [key: string]: number | string | object;
}

/**
 * Adds log
 *
 * @param type { string }: Type of the log
 * @param meta { LogMeta }: Meta data of the log
 * @param body { LogBody }: Body of the log
 */
export const addLog = async (type: string, meta: LogMeta, body: LogBody): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>> => {
  try {
    const log = {
      type,
      timestamp: admin.firestore.Timestamp.fromDate(new Date()),
      meta,
      body,
    };
    return await logsModel.add(log);
  } catch (err) {
    logger.error("Error in adding log", err);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};