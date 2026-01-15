import firestore from "../utils/firestore";
const logsModel = firestore.collection("logs");
import admin from "firebase-admin";
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");

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
export const addLog = async (
  type: string,
  meta: LogMeta,
  body: LogBody
): Promise<FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>> => {
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
