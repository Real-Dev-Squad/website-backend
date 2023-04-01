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
const userStatusModel = firestore.collection("usersStatus");

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

      return {
        isNewUser: false,
        userId: user.docs[0].id,
        incompleteUserDetails: user.docs[0].data().incompleteUserDetails,
      };
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
 * @param query { search, next, prev, size, page }: Filter for users
 * @return {Promise<userModel|Array>}
 */
const fetchUsers = async (query) => {
  try {
    // INFO: default user size set to 100
    // INFO: https://github.com/Real-Dev-Squad/website-backend/pull/873#discussion_r1064229932
    const size = parseInt(query.size) || 100;
    const doc = (query.next || query.prev) && (await userModel.doc(query.next || query.prev).get());
    let dbQuery = (query.prev ? userModel.limitToLast(size) : userModel.limit(size)).orderBy("username");
    if (Object.keys(query).length) {
      if (query.search) {
        dbQuery = dbQuery
          .startAt(query.search.toLowerCase().trim())
          .endAt(query.search.toLowerCase().trim() + "\uf8ff");
      }
      if (query.page) {
        const offsetValue = size * parseInt(query.page);
        dbQuery = dbQuery.offset(offsetValue);
      } else if (query.next) {
        dbQuery = dbQuery.startAfter(doc);
      } else if (query.prev) {
        dbQuery = dbQuery.endBefore(doc);
      }
    }
    const snapshot = await dbQuery.get();
    const firstDoc = snapshot.docs[0];
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

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
      nextId: lastDoc?.id ?? "",
      prevId: firstDoc?.id ?? "",
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

const getUsersBasedOnFilter = async (query) => {
  const itemTagsKeys = ["levelId", "levelName", "levelNumber", "tagId", "itemType", "tagType"];
  const userStateKeys = ["state"];
  const allQueryKeys = Object.keys(query);
  const doesTagQueryExist = arraysHaveCommonItem(itemTagsKeys, allQueryKeys);
  const doesStateQueryExist = arraysHaveCommonItem(userStateKeys, allQueryKeys);

  try {
    let callForItem = itemModel;
    let callForState = userStatusModel;
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (itemTagsKeys.includes(key)) {
        if (Array.isArray(value)) {
          callForItem = callForItem.where(key, "in", value);
        } else {
          callForItem = callForItem.where(key, "==", value);
        }
      } else if (userStateKeys.includes(key)) {
        if (Array.isArray(value)) {
          callForState = callForState.where("currentStatus.state", "in", value);
        } else {
          callForState = callForState.where("currentStatus.state", "==", value);
        }
      }
    });

    const items = [];
    if (doesTagQueryExist) {
      const data = await callForItem.get();
      data.forEach((doc) => {
        const item = {
          id: doc.id,
          ...doc.data(),
        };
        items.push(item);
      });
    }

    const stateItems = [];
    if (doesStateQueryExist) {
      const stateData = await callForState.get();
      stateData.forEach((doc) => {
        const item = {
          id: doc.id,
          ...doc.data(),
        };
        stateItems.push(item);
      });
    }

    let finalItems = [];

    if (doesTagQueryExist && doesStateQueryExist) {
      if (items.length && stateItems.length) {
        items.forEach((item) => {
          stateItems.forEach((stateItem) => {
            if (item.itemId === stateItem.userId) {
              finalItems.push(item.itemId);
            }
          });
        });
      }
    } else if (doesStateQueryExist && stateItems.length) {
      finalItems = stateItems.map((state) => state.userId);
    } else if (doesTagQueryExist && items.length) {
      finalItems = items.map((item) => item.itemId);
    }

    finalItems = [...new Set(finalItems)];
    const userDocs = [];

    const batchedItems = [];
    for (let i = 0; i < finalItems.length; i += 10) {
      const batch = finalItems.slice(i, i + 10);
      batchedItems.push(batch);
    }

    const userPromises = [];
    for (const batch of batchedItems) {
      const batchRefs = batch.map((itemId) => userModel.doc(itemId));
      userPromises.push(firestore.getAll(...batchRefs));
    }

    const userSnapshotsArray = await Promise.all(userPromises);

    userSnapshotsArray.forEach((userSnapshots) => {
      userSnapshots.forEach((userSnapshot) => {
        const data = userSnapshot.data();
        data.id = userSnapshot.id;
        userDocs.push(data);
      });
    });
    return userDocs;
  } catch (err) {
    logger.error("Error in getting Item based on filter", err);
    throw err;
  }
};

function arraysHaveCommonItem(array1, array2) {
  for (let i = 0; i < array1.length; i++) {
    for (let j = 0; j < array2.length; j++) {
      if (array1[i] === array2[j]) {
        return true;
      }
    }
  }
  return false;
}

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
  getUsersBasedOnFilter,
};
