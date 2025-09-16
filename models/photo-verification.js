/**
 * This file contains wrapper functions to interact with the photo-verification collection in the DB.
 */
import firestore from "../utils/firestore.js";

const photoVerificationModel = firestore.collection("photo-verification");

export { photoVerificationModel };

export default photoVerificationModel;
