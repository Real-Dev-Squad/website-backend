import config from "config";
import firebaseConfig from "../../firebase.json";
import { fetch } from "../../utils/fetch.js";

/**
 * Deletes all data from firestore emulator running locally.
 * To be used during tests for deleting the data as required.
 */
export default async () => {
  const credentialsObject = JSON.parse(config.firestore);
  const projectId = credentialsObject.project_id;

  const firestoreCleanUrl =
    `http://localhost:${firebaseConfig.emulators.firestore.port}` +
    `/emulator/v1/projects/${projectId}/databases/(default)/documents`;

  return await fetch(firestoreCleanUrl, "delete");
};
