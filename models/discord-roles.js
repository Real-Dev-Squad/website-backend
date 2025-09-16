/**
 * This file contains wrapper functions to interact with the discord-roles collection in the DB.
 */
import firestore from "../utils/firestore.js";

const discordRoleModel = firestore.collection("discord-roles");

export { discordRoleModel };

export default discordRoleModel;
