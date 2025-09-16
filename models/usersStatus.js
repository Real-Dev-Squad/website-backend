/**
 * This file is an alias to provide the usersStatus Firestore collection
 */
import firestore from "../utils/firestore.js";

const usersStatusCollection = firestore.collection("usersStatus");

export default usersStatusCollection;
