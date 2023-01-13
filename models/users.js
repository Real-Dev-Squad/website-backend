/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */
const walletConstants = require("../constants/wallets");

const firestore = require("../utils/firestore");
const { fetchWallet, createWallet } = require("../models/wallets");
const userModel = firestore.collection("users");
const joinModel = firestore.collection("applicants");
const itemModel = firestore.collection("itemTags");

/**
 * Adds or updates the user data
 *
 * @param userData { Object }: User data object to be stored in DB
 * @param userId { String }: User Id String to be used to update the user
 * @return {Promise<{isNewUser: boolean, userId: string}|{isNewUser: boolean, userId: string}>}
 */
const addOrUpdate = async (userData, userId = null) => {
  try {
    // userId exists Update user
    if (userId !== null) {
      const user = await userModel.doc(userId).get();
      const isNewUser = !user.data();
      // user exists update user
      if (user.data()) {
        await userModel.doc(userId).set({
          ...user.data(),
          ...userData,
        });
      }

      return { isNewUser, userId };
    }

    // userId is null, Add or Update user
    const user = await userModel.where("github_id", "==", userData.github_id).limit(1).get();
    if (!user.empty) {
      await userModel.doc(user.docs[0].id).set(userData, { merge: true });

      return { isNewUser: false, userId: user.docs[0].id };
    }

    // Add new user
    /*
       Adding default archived role enables us to query for only
       the unarchived users in the /members endpoint
       For more info : https://github.com/Real-Dev-Squad/website-backend/issues/651
     */
    userData.roles = { archived: false };
    userData.incompleteUserDetails = true;
    const userInfo = await userModel.add(userData);
    return { isNewUser: true, userId: userInfo.id };
  } catch (err) {
    logger.error("Error in adding or updating user", err);
    throw err;
  }
};

const addJoinData = async (userData) => {
  try {
    await joinModel.add(userData);
  } catch (err) {
    logger.error("Error in adding data", err);
    throw err;
  }
};

const getJoinData = async (userId) => {
  try {
    const userData = [];
    const joinData = await joinModel.where("userId", "==", userId).limit(1).get();
    joinData.forEach((data) => {
      userData.push({
        id: data.id,
        ...data.data(),
      });
    });
    return userData;
  } catch (err) {
    logger.log("Could not get", err);
    throw err;
  }
};

/**
 * Fetches users with the given skill
 *
 * @param skill { string }: Skill
 * @return @return {Promise<users>}
 */

const getSuggestedUsers = async (skill) => {
  try {
    const data = await itemModel.where("itemType", "==", "USER").where("tagId", "==", skill).get();
    let users = [];

    const dataSet = new Set();

    if (!data.empty) {
      data.forEach((doc) => {
        const docUserId = doc.data().itemId;
        if (!dataSet.has(docUserId)) {
          dataSet.add(docUserId);
        }
      });
      const usersId = Array.from(dataSet);
      const usersArray = usersId.map((userId) => fetchUser({ userId }));
      users = await Promise.all(usersArray);
    }

    return { users };
  } catch (err) {
    logger.error("Error in getting suggested user", err);
    throw err;
  }
};

/**
 * Fetches the data about our users
 * @param query { search, next, prev(previous), size }: Filter for users
 * @return {Promise<userModel|Array>}
 */
const fetchUsers = async (query, pageState) => {
  const page = parseInt(query.page);
  let cookie = {};
  try {
    let dbQuery = userModel;
    if (Object.keys(query).length) {
      dbQuery = dbQuery.orderBy("username");
      if (query.search) {
        dbQuery = dbQuery
          .startAt(query.search.toLowerCase().trim())
          .endAt(query.search.toLowerCase().trim() + "\uf8ff");
      }
      if (page && pageState && pageState[page]) {
        const doc = pageState[page].id && (await userModel.doc(pageState[page].id).get());
        if (pageState[page].type === "current" && doc) {
          dbQuery = dbQuery.startAt(doc).limit(parseInt(query.size) || 100);
        } else if (pageState[page].type === "previous" && doc) {
          dbQuery = dbQuery.endBefore(doc).limitToLast(parseInt(query.size) || 100);
        } else if (pageState[page].type === "next" && doc) {
          dbQuery = dbQuery.startAfter(doc).limit(parseInt(query.size) || 100);
        }
      }

      if (query.size && ((pageState && !pageState[page] && !pageState[page].id) || !pageState)) {
        dbQuery = dbQuery.limit(parseInt(query.size) || 100);
      }
    }
    const snapshot = await dbQuery.get();

    if (page) {
      const firstDoc = snapshot.docs[0]; // sending the id of the first doc of current batch, for client accessing previous batch/page
      const lastDoc = snapshot.docs[snapshot.docs.length - 1]; // sending the id of the last doc of current batch, for client accessing next batch/page
      const current = { [page]: { id: firstDoc ? firstDoc.id : "", type: "current" } };
      const next = { [page + 1]: { id: lastDoc ? lastDoc.id : "", type: "next" } };
      const prev = page > 1 ? { [page - 1]: { id: firstDoc ? firstDoc.id : "", type: "previous" } } : {};
      cookie = { ...prev, ...current, ...next };
    }

    const allUsers = [];

    snapshot.forEach((doc) => {
      allUsers.push({
        id: doc.id,
        ...doc.data(),
        phone: undefined,
        email: undefined,
        tokens: undefined,
        chaincode: undefined,
      });
    });
    return {
      allUsers,
      cookie,
    };
  } catch (err) {
    logger.error("Error retrieving user data", err);
    throw err;
  }
};

/**
 * Fetches the user data from the the provided username or userId
 *
 * @param { Object }: Object with username and userId, any of the two can be used
 * @return {Promise<{userExists: boolean, user: <userModel>}|{userExists: boolean, user: <userModel>}>}
 */
const fetchUser = async ({ userId = null, username = null }) => {
  try {
    let userData, id;
    if (username) {
      const user = await userModel.where("username", "==", username).limit(1).get();

      user.forEach((doc) => {
        id = doc.id;
        userData = doc.data();
      });
    } else if (userId) {
      const user = await userModel.doc(userId).get();
      id = userId;
      userData = user.data();
    }
    return {
      userExists: !!userData,
      user: {
        id,
        ...userData,
        tokens: undefined,
        chaincode: undefined,
      },
    };
  } catch (err) {
    logger.error("Error retrieving user data", err);
    throw err;
  }
};

/**
 * Sets the incompleteUserDetails field of passed UserId to false
 *
 * @param userId { string }: User id
 */
const setIncompleteUserDetails = async (userId) => {
  const userRef = userModel.doc(userId);
  const doc = await userRef.get();
  if (doc.exists) {
    return userRef.update({
      incompleteUserDetails: false,
    });
  }
  return {};
};

/**
 * Once the user is fully signed up, initialize other
 * stuff needed for their account
 *
 * @param userId { string }: User id
 */
const initializeUser = async (userId) => {
  // Create wallet and give them initial amount
  const userWallet = await fetchWallet(userId);
  if (!userWallet) {
    await createWallet(userId, walletConstants.INITIAL_WALLET);
  }

  return true;
};

/**
 * Sets the user picture field of passed UserId to image data
 *
 * @param image { Object }: image data ( {publicId, url} )
 * @param userId { string }: User id
 */
const updateUserPicture = async (image, userId) => {
  try {
    const userDoc = userModel.doc(userId);
    await userDoc.update({
      picture: image,
    });
  } catch (err) {
    logger.error("Error updating user picture data", err);
    throw err;
  }
};

/**
 * fetch the users image by passing array of users
 *
 * @param users {array}
 */
const fetchUserImage = async (users) => {
  const data = await userModel.where("username", "in", users).get();
  const images = {};
  data.forEach((item) => {
    images[item.data().username] = item.data().img;
  });
  return images;
};

const fetchUserSkills = async (id) => {
  try {
    const data = await itemModel.where("itemId", "==", id).where("tagType", "==", "SKILL").get();
    const skills = [];

    if (!data.empty) {
      data.forEach((doc) => {
        skills.push({ id: doc.id, ...doc.data() });
      });
    }
    return { skills };
  } catch (err) {
    logger.error("Error fetching skills in model", err);
    throw err;
  }
};

module.exports = {
  addOrUpdate,
  fetchUsers,
  fetchUser,
  setIncompleteUserDetails,
  initializeUser,
  updateUserPicture,
  fetchUserImage,
  addJoinData,
  getJoinData,
  getSuggestedUsers,
  fetchUserSkills,
};
