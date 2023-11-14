const usersService = require("../services/dataAccessLayer");
const admin = require("firebase-admin");

const generateLink = (queries) => {
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queries)) {
    if (!value) continue;
    urlSearchParams.append(key, value);
  }
  return "/taskRequests?" + urlSearchParams.toString();
};

const buildTaskRequests = (taskRequests, initialArray = []) => {
  if (!taskRequests.empty) {
    taskRequests.forEach((taskRequests) => {
      initialArray.push({
        id: taskRequests.id,
        ...taskRequests.data(),
      });
    });
  }
  return initialArray;
};

const transformTaskRequests = async (taskRequestsList) => {
  const userIdSet = new Set();
  taskRequestsList.forEach((data) => {
    data.users.forEach((userData) => {
      userIdSet.add(userData.userId);
    });
  });

  const userList = await usersService.fetchUsersForKeyValues(
    admin.firestore.FieldPath.documentId(),
    Array.from(userIdSet)
  );

  const usersMap = new Map(userList.map((data) => [data.id, data]));
  taskRequestsList.forEach((data) => {
    data.users = data.users.map((userData) => {
      const { username, first_name: firstName, last_name: lastName, picture } = usersMap.get(userData.userId);
      return { ...userData, username: username, first_name: firstName, last_name: lastName, picture };
    });
  });
};

module.exports = {
  generateLink,
  buildTaskRequests,
  transformTaskRequests,
};
