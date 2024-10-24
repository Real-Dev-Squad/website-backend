/**
 * This file contains wrapper functions to interact with the DB.
 * This will contain the DB schema if we start consuming an ORM for managing the DB operations
 */
const walletConstants = require("../constants/wallets");

const firestore = require("../utils/firestore");
const { fetchWallet, createWallet } = require("../models/wallets");
const { updateUserStatus } = require("../models/userStatus");
const { arraysHaveCommonItem, chunks } = require("../utils/array");
const { archiveUsers } = require("../services/users");
const { ALLOWED_FILTER_PARAMS, FIRESTORE_IN_CLAUSE_SIZE } = require("../constants/users");
const { DOCUMENT_WRITE_SIZE } = require("../constants/constants");
const { userState } = require("../constants/userStatus");
const { BATCH_SIZE_IN_CLAUSE } = require("../constants/firebase");
const ROLES = require("../constants/roles");
const userModel = firestore.collection("users");
const joinModel = firestore.collection("applicants");
const itemModel = firestore.collection("itemTags");
const userStatusModel = firestore.collection("usersStatus");
const photoVerificationModel = firestore.collection("photo-verification");
const { ITEM_TAG, USER_STATE } = ALLOWED_FILTER_PARAMS;
const admin = require("firebase-admin");
const { INTERNAL_SERVER_ERROR } = require("../constants/errorMessages");
const { AUTHORITIES } = require("../constants/authorities");
const { formatUsername } = require("../utils/username");

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
        await userModel.doc(userId).set(
          {
            ...user.data(),
            ...userData,
            updated_at: Date.now(),
          },
          { merge: true }
        );
      }

      return { isNewUser, userId };
    }

    // userId is null, Add or Update user
    let user;
    if (userData.github_user_id) {
      user = await userModel.where("github_user_id", "==", userData.github_user_id).limit(1).get();
    }
    if (!user || (user && user.empty)) {
      user = await userModel.where("github_id", "==", userData.github_id).limit(1).get();
    }
    if (user && !user.empty && user.docs !== null) {
      await userModel.doc(user.docs[0].id).set({ ...userData, updated_at: Date.now() }, { merge: true });
      const data = user.docs[0].data();
      return {
        isNewUser: false,
        userId: user.docs[0].id,
        incompleteUserDetails: user.docs[0].data().incompleteUserDetails,
        updated_at: Date.now(),
        role: Object.values(AUTHORITIES).find((role) => data.roles[role]) || AUTHORITIES.USER,
      };
    }

    // Add new user
    /*
       Adding default archived role enables us to query for only
       the unarchived users in the /members endpoint
       For more info : https://github.com/Real-Dev-Squad/website-backend/issues/651
     */
    userData.roles = { archived: false, in_discord: false };
    userData.incompleteUserDetails = true;
    const userInfo = await userModel.add(userData);
    return {
      isNewUser: true,
      role: AUTHORITIES.USER,
      userId: userInfo.id,
      incompleteUserDetails: true,
      updated_at: Date.now(),
    };
  } catch (err) {
    logger.error("Error in adding or updating user", err);
    throw err;
  }
};

const addJoinData = async (userData) => {
  try {
    await joinModel.add(userData);
    await updateUserStatus(userData.userId, {
      currentStatus: { state: userState.ONBOARDING },
      monthlyHours: { committed: 4 * userData.intro.numberOfHours },
    });
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
        ...data.data(),
        id: data.id,
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
const fetchPaginatedUsers = async (query) => {
  const isDevMode = query.dev === "true";

  try {
    const size = parseInt(query.size) || 100;
    const doc = (query.next || query.prev) && (await userModel.doc(query.next || query.prev).get());

    let dbQuery;
    /**
     * !!NOTE : At the time of writing we only support member in the role query
     * this will get fixed with the new onboarding flow, contact @tejaskh3 for more info
     *
     * if you're making changes to this code remove the archived check in the role query, example: role=archived,member
     */
    if (query.roles === "member") {
      dbQuery = userModel.where("roles.archived", "==", false).where("roles.member", "==", true);
    } else {
      dbQuery = userModel.where("roles.archived", "==", false).orderBy("username");
    }

    let compositeQuery = [dbQuery];
    if (isDevMode) {
      const usernameQuery = userModel.where("roles.archived", "==", false).orderBy("username_lowercase");
      const firstNameQuery = userModel.where("roles.archived", "==", false).orderBy("first_name_lowercase");
      const lastNameQuery = userModel.where("roles.archived", "==", false).orderBy("last_name_lowercase");
      compositeQuery = [usernameQuery, firstNameQuery, lastNameQuery];
    }

    if (query.prev) {
      compositeQuery = compositeQuery.map((query) => query.limitToLast(size));
      dbQuery = dbQuery.limitToLast(size);
    } else {
      compositeQuery = compositeQuery.map((query) => query.limit(size));
      dbQuery = dbQuery.limit(size);
    }

    if (Object.keys(query).length) {
      if (query.search) {
        const searchValue = query.search.toLowerCase().trim();
        dbQuery = dbQuery.startAt(searchValue).endAt(searchValue + "\uf8ff");
        compositeQuery = compositeQuery.map((query) => query.startAt(searchValue).endAt(searchValue + "\uf8ff"));
      }
      if (query.page) {
        const offsetValue = size * parseInt(query.page);
        dbQuery = dbQuery.offset(offsetValue);
        compositeQuery = compositeQuery.map((query) => query.offset(offsetValue));
      } else if (query.next) {
        dbQuery = dbQuery.startAfter(doc);
        compositeQuery = compositeQuery.map((query) => query.startAfter(doc));
      } else if (query.prev) {
        dbQuery = dbQuery.endBefore(doc);
        compositeQuery = compositeQuery.map((query) => query.endBefore(doc));
      }
    }

    const snapshot = await dbQuery.get();
    const snapshots = await Promise.all(compositeQuery.map((query) => query.get()));

    const allUsers = [];
    const userMap = new Map();

    const processSnapshot = (snapshot) => {
      snapshot.forEach((doc) => {
        const userId = doc.id;
        if (!userMap.has(userId)) {
          userMap.set(userId, doc.data());
          allUsers.push({ ...doc.data(), id: userId });
        }
      });
    };

    processSnapshot(snapshot);
    snapshots.forEach(processSnapshot);

    const firstDoc = snapshot.docs[0];
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];

    return {
      allUsers,
      nextId: lastDoc?.id || "",
      prevId: firstDoc?.id || "",
    };
  } catch (err) {
    logger.error("Error retrieving user data", err);
    throw err;
  }
};

const fetchUsers = async (usernames = []) => {
  try {
    const dbQuery = userModel;
    const users = [];

    const groups = [];
    for (let i = 0; i < usernames.length; i += BATCH_SIZE_IN_CLAUSE) {
      groups.push(usernames.slice(i, i + BATCH_SIZE_IN_CLAUSE));
    }

    // For each group, write a separate query
    const promises = groups.map((group) => {
      return dbQuery.where("github_id", "in", group).get();
    });

    const snapshots = await Promise.all(promises);

    snapshots.forEach((snapshot) => {
      snapshot.forEach((doc) => {
        users.push({
          ...doc.data(),
          id: doc.id,
        });
      });
    });

    return {
      users,
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
const fetchUser = async ({ userId = null, username = null, githubUsername = null, discordId = null }) => {
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
    } else if (githubUsername) {
      const user = await userModel.where("github_id", "==", githubUsername).limit(1).get();
      user.forEach((doc) => {
        id = doc.id;
        userData = doc.data();
      });
    } else if (discordId) {
      const user = await userModel.where("discordId", "==", discordId).where("roles.archived", "==", false).get();
      user.forEach((doc) => {
        id = doc.id;
        userData = doc.data();
      });
    }

    if (userData && userData.disabled_roles !== undefined) {
      if (userData.disabled_roles.length > 0 && userData.roles !== undefined) {
        for (const role of userData.disabled_roles) {
          userData.roles[`${role}`] = false;
        }
      }
    }
    return {
      userExists: !!userData,
      user: {
        ...userData,
        id,
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
      updated_at: Date.now(),
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
  await updateUserStatus(userId, { currentStatus: { state: userState.ONBOARDING }, monthlyHours: { committed: 0 } });
  return true;
};

/**
 * Adds user data for verification by moderators
 * @param userId {String} - RDS User Id
 * @param discordId {String} - Discord id of RDS user
 * @param profileImageUrl {String} - profile image URL of user
 * @param discordImageUrl {String} - discord image URL of user
 * @return {Promise<{message: string}|{message: string}>}
 * @throws {Error} - If error occurs while creating Verification Entry
 */
const addForVerification = async (userId, discordId, profileImageUrl, discordImageUrl) => {
  let isNotVerifiedSnapshot;
  try {
    isNotVerifiedSnapshot = await photoVerificationModel.where("userId", "==", userId).get();
  } catch (err) {
    logger.error("Error in creating Verification Entry", err);
    throw err;
  }
  const unverifiedUserData = {
    userId,
    discordId,
    discord: { url: discordImageUrl, approved: false, date: admin.firestore.Timestamp.fromDate(new Date()) },
    profile: { url: profileImageUrl, approved: false, date: admin.firestore.Timestamp.fromDate(new Date()) },
  };
  try {
    if (!isNotVerifiedSnapshot.empty) {
      const unVerifiedDocument = isNotVerifiedSnapshot.docs[0];
      const documentRef = unVerifiedDocument.ref;
      // DOESN"T CHANGE THE APPROVAL STATE OF DISCORD IMAGE IF ALREADY VERIFIED
      unverifiedUserData.discord.approved = unVerifiedDocument.data().discord.approved || false;

      await documentRef.update(unverifiedUserData);
    } else await photoVerificationModel.add(unverifiedUserData);
  } catch (err) {
    logger.error("Error in creating Verification Entry", err);
    throw err;
  }
  return { message: "Profile data added for verification successfully" };
};

/**
 * Removes if user passed a valid image; ignores if no unverified record
 * @param userId {String} - RDS user Id
 * @param type {String} - type of image that was verified
 * @return {Promise<{message: string}|{message: string}>}
 * @throws {Error} - If error occurs while verifying user's image
 */
const markAsVerified = async (userId, imageType) => {
  try {
    const verificationUserDataSnapshot = await photoVerificationModel.where("userId", "==", userId).get();
    // THROWS ERROR IF NO DOCUMENT FOUND
    if (verificationUserDataSnapshot.empty) {
      throw new Error("No verification document record data for user was found");
    }
    // VERIFIES BASED ON THE TYPE OF IMAGE
    const imageVerificationType = imageType === "discord" ? "discord.approved" : "profile.approved";
    const documentRef = verificationUserDataSnapshot.docs[0].ref;
    await documentRef.update({ [imageVerificationType]: true });
    return { message: "User image data verified successfully" };
  } catch (err) {
    logger.error("Error while Removing Verification Entry", err);
    throw err;
  }
};

/**
 * Removes if user passed a valid image; ignores if no unverified record
 * @param userId {String} - RDS user Id
 * @return {Promise<{Object}|{Object}>}
 * @throws {Error} - If error occurs while fetching user's image verification entry
 */
const getUserImageForVerification = async (userId) => {
  try {
    const verificationImagesSnapshot = await photoVerificationModel.where("userId", "==", userId).get();
    if (verificationImagesSnapshot.empty) {
      throw new Error(`No document with userId: ${userId} was found!`);
    }
    return verificationImagesSnapshot.docs[0].data();
  } catch (err) {
    logger.error("Error while Removing Verification Entry", err);
    throw err;
  }
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
      updated_at: Date.now(),
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
        skills.push({ ...doc.data(), id: doc.id });
      });
    }
    return { skills };
  } catch (err) {
    logger.error("Error fetching skills in model", err);
    throw err;
  }
};

const getRdsUserInfoByGitHubUsername = async (githubUsername) => {
  const { user } = await fetchUser({ githubUsername });

  return {
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    username: user.username ?? "",
  };
};

/**
 * Fetches user data based on the filter query
 *
 * @param {Object} query - Object with query parameters
 * @param {Array} query.levelId - Array of levelIds to filter the users on
 * @param {Array} query.levelName - Array of levelNames to filter the users on
 * @param {Array} query.levelNumber - Array of levelNumbers to filter the users on
 * @param {Array} query.tagId - Array of tagIds to filter the users on
 * @param {Array} query.state - Array of states to filter the users on
 * @param {String} query.role - filter the users on role
 * @param {String} query.verified - filter the users on verified i.e, discordId data
 * @return {Promise<Array>} - Array of user documents that match the filter criteria
 */

const getUsersBasedOnFilter = async (query) => {
  const allQueryKeys = Object.keys(query);
  const doesTagQueryExist = arraysHaveCommonItem(ITEM_TAG, allQueryKeys);
  const doesStateQueryExist = arraysHaveCommonItem(USER_STATE, allQueryKeys);

  const calls = {
    item: itemModel,
    state: userStatusModel,
  };
  calls.item = calls.item.where("itemType", "==", "USER").where("tagType", "==", "SKILL");

  Object.entries(query).forEach(([key, value]) => {
    const isTagKey = ITEM_TAG.includes(key);
    const isStateKey = USER_STATE.includes(key);
    const isValueArray = Array.isArray(value);

    if (isTagKey) {
      calls.item = isValueArray ? calls.item.where(key, "in", value) : calls.item.where(key, "==", value);
    } else if (isStateKey) {
      calls.state = isValueArray
        ? calls.state.where("currentStatus.state", "in", value)
        : calls.state.where("currentStatus.state", "==", value);
    }
  });

  const tagItems = doesTagQueryExist ? (await calls.item.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() })) : [];
  const stateItems = doesStateQueryExist
    ? (await calls.state.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    : [];
  let finalItems = [];

  if (doesTagQueryExist && doesStateQueryExist) {
    if (stateItems.length && tagItems.length) {
      const stateItemIds = new Set(stateItems.map((item) => item.userId));
      finalItems = tagItems.filter((item) => stateItemIds.has(item.itemId)).map((item) => item.itemId);
    }
  } else if (doesStateQueryExist) {
    finalItems = stateItems.map((item) => item.userId);
  } else if (doesTagQueryExist) {
    finalItems = tagItems.map((item) => item.itemId);
  }

  if (finalItems.length) {
    finalItems = [...new Set(finalItems)];
    const userRefs = finalItems.map((itemId) => userModel.doc(itemId));
    const userDocs = (await firestore.getAll(...userRefs)).map((doc) => ({ id: doc.id, ...doc.data() }));
    const filteredUserDocs = userDocs.filter((doc) => !doc.roles?.archived);
    if (query.time && query.state === "ONBOARDING") {
      const fetchUsersWithOnBoardingState = await getUsersWithOnboardingStateInRange(
        filteredUserDocs,
        stateItems,
        query.time
      );
      return fetchUsersWithOnBoardingState;
    }
    return filteredUserDocs;
  }

  const { role: roleQuery, verified: verifiedQuery } = query;

  if (roleQuery) {
    const filteredUsers = [];
    const snapshot = await userModel.where(`roles.${roleQuery}`, "==", true).get();
    snapshot.forEach((doc) => {
      filteredUsers.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    if (roleQuery === ROLES.ARCHIVED) {
      return filteredUsers;
    }

    return filteredUsers.filter((user) => !user.roles?.archived);
  }
  if (verifiedQuery === "true") {
    const filteredUsers = [];
    const snapshot = await userModel.where("discordId", "!=", null).get();
    snapshot.forEach((doc) => {
      filteredUsers.push({
        ...doc.data(),
        id: doc.id,
      });
    });

    return filteredUsers.filter((user) => !user.roles?.archived);
  }

  return [];
};

const getUsersWithOnboardingStateInRange = async (filteredUserDocs, stateItems, time) => {
  const usersInRange = [];
  const range = Number(time.split("d")[0]);
  const filteredUsers = filteredUserDocs.filter((userDoc) => {
    return stateItems.some((stateItem) => stateItem.userId === userDoc.id);
  });
  filteredUsers.forEach((user) => {
    if (user.discordJoinedAt && user.roles.in_discord) {
      const userDiscordJoinedDate = new Date(user.discordJoinedAt);
      const currentTimeStamp = new Date().getTime();
      const timeDifferenceInMilliseconds = currentTimeStamp - userDiscordJoinedDate.getTime();
      const currentAndUserJoinedDateDifference = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60 * 24));
      if (currentAndUserJoinedDateDifference > range) {
        usersInRange.push(user);
      }
    }
  });
  return usersInRange;
};
/**
 * Fetch all users
 *
 * @return {Promise<users>}
 */

const getDiscordUsers = async () => {
  try {
    const usersRef = await userModel.where("roles.archived", "==", false).get();
    const users = [];
    usersRef.forEach((user) => {
      const userData = user.data();
      if (userData?.discordId)
        users.push({
          ...userData,
          id: user.id,
        });
    });
    return users;
  } catch (err) {
    logger.error(`Error while fetching all users: ${err}`);
    throw err;
  }
};

const fetchAllUsers = async () => {
  const users = [];
  const usersQuerySnapshot = await userModel.get();
  usersQuerySnapshot.forEach((user) => users.push({ ...user.data(), id: user.id }));
  return users;
};

const archiveUserIfNotInDiscord = async () => {
  try {
    const snapshot = await userModel.where("roles.in_discord", "==", false).where("roles.archived", "==", false).get();
    const usersNotInDiscord = [];
    let summary = {
      totalUsers: snapshot.size,
      totalUsersArchived: 0,
      totalOperationsFailed: 0,
      updatedUserDetails: [],
      failedUserDetails: [],
    };

    if (snapshot.size === 0) {
      return summary;
    }

    snapshot.forEach((user) => {
      const id = user.id;
      const userData = user.data();
      usersNotInDiscord.push({ ...userData, id });
    });

    const userNotInDiscordChunks = chunks(usersNotInDiscord, DOCUMENT_WRITE_SIZE);
    for (const users of userNotInDiscordChunks) {
      const res = await archiveUsers(users);
      summary = {
        ...summary,
        totalUsersArchived: (summary.totalUsersArchived += res.totalUsersArchived),
        totalOperationsFailed: (summary.totalOperationsFailed += res.totalOperationsFailed),
        updatedUserDetails: [...summary.updatedUserDetails, ...res.updatedUserDetails],
        failedUserDetails: [...summary.failedUserDetails, ...res.failedUserDetails],
      };
    }

    if (summary.totalOperationsFailed === summary.totalUsers) {
      throw Error(INTERNAL_SERVER_ERROR);
    }

    return summary;
  } catch (error) {
    logger.error(`Error in updating Users archived role:  ${error}`);
    throw error;
  }
};
/**
 *
 * @param {[string]} userIds  Array id's of user
 * @returns Object containing the details of the users whose userId was provided.
 */
const fetchUserByIds = async (userIds = []) => {
  if (userIds.length === 0) {
    return {};
  }
  try {
    const users = [];
    const usersRefs = userIds.map((docId) => userModel.doc(docId));
    const documents = await firestore.getAll(...usersRefs);
    documents.forEach((snapshot) => {
      if (snapshot.exists) {
        users.push({
          ...snapshot.data(),
          id: snapshot.id,
        });
      }
    });
    return users;
  } catch (err) {
    logger.error("Error retrieving user data", err);
    throw err;
  }
};

const removeGitHubToken = async (users) => {
  try {
    const length = users.length;

    let numberOfBatches = length / 500;
    const remainder = length % 500;

    if (remainder) {
      numberOfBatches = numberOfBatches + 1;
    }

    const batchArray = [];
    for (let i = 0; i < numberOfBatches; i++) {
      const batch = firestore.batch();
      batchArray.push(batch);
    }

    let batchIndex = 0;
    let operations = 0;

    for (let i = 0; i < length; i++) {
      batchArray[batchIndex].update(users[i], { tokens: admin.firestore.FieldValue.delete() });
      operations++;

      if (operations === 500) {
        batchIndex++;
        operations = 0;
      }
    }

    await Promise.all(batchArray.map(async (batch) => await batch.commit()));
  } catch (err) {
    logger.error(`Error while deleting tokens field: ${err}`);
    throw err;
  }
};

const getUsersByRole = async (role) => {
  try {
    const usersRef = await userModel.where(`roles.${role}`, "==", true).get();
    const users = [];
    usersRef.docs.forEach((user) => {
      const userData = user.data();
      users.push({
        ...userData,
        id: user.id,
      });
    });
    return users;
  } catch (err) {
    logger.error(`Fetching users with role: ${role} exitted with an error: ${err}`);
    throw err;
  }
};

/**
 * Updates given list of users in batch
 * @param usersData {Array} - Users list as an array.
 * @param usersData.id {String} - User id which is the primary key of user model.
 */
const updateUsersInBatch = async (usersData) => {
  try {
    const bulkWriter = firestore.bulkWriter();

    usersData.forEach((user) => {
      const id = user.id;
      delete user.id;
      bulkWriter.update(userModel.doc(id), { ...user, updated_at: Date.now() });
    });

    await bulkWriter.close();
  } catch (err) {
    logger.error("Firebase batch operation failed!");
  }
};

/**
 * Fetch users based on document key and value.
 * @param documentKey {String} - Model field path.
 * @param value {String} - Field value.
 */
const fetchUserForKeyValue = async (documentKey, value) => {
  try {
    const userRefList = await userModel.where(documentKey, "==", value).get();
    const users = [];
    userRefList.forEach((user) => {
      const userData = user.data();
      if (userData)
        users.push({
          ...userData,
          id: user.id,
        });
    });
    return users;
  } catch (err) {
    logger.error("Firebase fetch operation failed!", err);
    return [];
  }
};

/**
 * Fetch users based on document key and value.
 * @param documentKey {String} - Model field path.
 * @param valueList {Array} - List of values to be matched.
 */
const fetchUsersListForMultipleValues = async (documentKey, valueList) => {
  try {
    const documentIdChunks = chunks(valueList, FIRESTORE_IN_CLAUSE_SIZE);

    const allUserRefPromiseList = [];
    for (const documentIds of documentIdChunks) {
      const usersRefPromise = await userModel.where(documentKey, "in", documentIds).get();
      allUserRefPromiseList.push(usersRefPromise);
    }
    const userRefList = await Promise.all(allUserRefPromiseList);

    const users = [];
    for (const usersRef of userRefList) {
      usersRef.forEach((user) => {
        const userData = user.data();
        if (userData)
          users.push({
            ...userData,
            id: user.id,
          });
      });
    }
    return users;
  } catch (err) {
    logger.error("Firebase fetch operation failed!");
    return [];
  }
};

const getNonNickNameSyncedUsers = async () => {
  try {
    const usersRef = await userModel
      .where("roles.archived", "==", false)
      .where("nickname_synced", "==", false)
      .where("discordId", "!=", null)
      .get();
    const users = [];
    usersRef.forEach((user) => {
      const userData = user.data();
      if (userData?.discordId)
        users.push({
          ...userData,
          id: user.id,
        });
    });
    return users;
  } catch (err) {
    logger.error(`Error while fetching all users: ${err}`);
    throw err;
  }
};

const updateUsernamesInBatch = async (usersData) => {
  const batch = firestore.batch();
  const usersBatch = [];
  const summary = {
    totalUpdatedUsernames: 0,
    totalOperationsFailed: 0,
    failedUserDetails: [],
  };

  usersData.forEach((user) => {
    const updateUserData = { ...user, username: user.username };
    batch.update(userModel.doc(user.id), updateUserData);
    usersBatch.push(user.id);
  });

  try {
    await batch.commit();
    summary.totalUpdatedUsernames += usersData.length;
    return { ...summary };
  } catch (err) {
    logger.error("Firebase batch Operation Failed!");
    summary.totalOperationsFailed += usersData.length;
    summary.failedUserDetails = [...usersBatch];
    return { ...summary };
  }
};

const updateUsersWithNewUsernames = async () => {
  try {
    const snapshot = await userModel.get();

    const nonMemberUsers = snapshot.docs.filter((doc) => {
      const userData = doc.data();
      const roles = userData.roles;

      return !(roles?.member === true || roles?.super_user === true || userData.incompleteUserDetails === true);
    });

    const summary = {
      totalUsers: nonMemberUsers.length,
      totalUpdatedUsernames: 0,
      totalOperationsFailed: 0,
      failedUserDetails: [],
    };

    if (nonMemberUsers.length === 0) {
      return summary;
    }

    const usersToUpdate = [];
    const nameToUsersMap = new Map();

    nonMemberUsers.forEach((userDoc) => {
      const userData = userDoc.data();
      const id = userDoc.id;

      const firstName = userData.first_name?.split(" ")[0]?.toLowerCase();
      const lastName = userData.last_name?.toLowerCase();

      if (!firstName || !lastName) {
        return;
      }

      const fullName = `${firstName}-${lastName}`;
      if (!nameToUsersMap.has(fullName)) {
        nameToUsersMap.set(fullName, []);
      }

      nameToUsersMap.get(fullName).push({ id, userData, createdAt: userData.created_at });
    });

    for (const [, usersWithSameName] of nameToUsersMap.entries()) {
      usersWithSameName.sort((a, b) => a.createdAt - b.createdAt);

      usersWithSameName.forEach((user, index) => {
        const suffix = index + 1;
        const formattedUsername = formatUsername(user.userData.first_name, user.userData.last_name, suffix);

        if (user.userData.username !== formattedUsername) {
          usersToUpdate.push({ ...user.userData, id: user.id, username: formattedUsername });
        }
      });
    }

    const userChunks = chunks(usersToUpdate, DOCUMENT_WRITE_SIZE);

    const updatedUsersPromises = await Promise.all(
      userChunks.map(async (users) => {
        const res = await updateUsernamesInBatch(users);
        return res;
      })
    );

    updatedUsersPromises.forEach((res) => {
      summary.totalUpdatedUsernames += res.totalUpdatedUsernames;
      summary.totalOperationsFailed += res.totalOperationsFailed;
      if (res.failedUserDetails.length > 0) {
        summary.failedUserDetails.push(...res.failedUserDetails);
      }
    });

    if (summary.totalOperationsFailed === summary.totalUsers) {
      throw new Error("INTERNAL_SERVER_ERROR");
    }

    return summary;
  } catch (error) {
    logger.error(`Error in updating usernames: ${error}`);
    throw error;
  }
};

module.exports = {
  addOrUpdate,
  fetchPaginatedUsers,
  fetchUser,
  setIncompleteUserDetails,
  initializeUser,
  updateUserPicture,
  fetchUserImage,
  addJoinData,
  getJoinData,
  getSuggestedUsers,
  fetchUserSkills,
  getRdsUserInfoByGitHubUsername,
  fetchUsers,
  getUsersBasedOnFilter,
  markAsVerified,
  addForVerification,
  getUserImageForVerification,
  getDiscordUsers,
  fetchAllUsers,
  archiveUserIfNotInDiscord,
  removeGitHubToken,
  getUsersByRole,
  fetchUserByIds,
  updateUsersInBatch,
  fetchUsersListForMultipleValues,
  fetchUserForKeyValue,
  getNonNickNameSyncedUsers,
  updateUsersWithNewUsernames,
};
