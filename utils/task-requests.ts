import { TaskRequestType } from "../typeDefinitions/task-requests";
import { User } from "../typeDefinitions/users";
import * as usersService from "../services/dataAccessLayer.js";
import admin from "firebase-admin";

const generateLink = (queries: { [key: string]: string }): string => {
  const urlSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queries)) {
    if (!value) continue;
    urlSearchParams.append(key, value);
  }
  return "/taskRequests?" + urlSearchParams.toString();
};

const buildTaskRequests = (taskRequests: any, initialArray: any = []) => {
  if (!taskRequests.empty) {
    taskRequests.forEach((taskRequests: any) => {
      initialArray.push({
        id: taskRequests.id,
        ...taskRequests.data(),
      });
    });
  }
  return initialArray;
};

const transformTaskRequests = async (taskRequestsList: TaskRequestType[]) => {
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

  const usersMap = new Map<string, User>(userList.map((data) => [data.id, data]));
  taskRequestsList.forEach((data) => {
    data.users = data.users.map((userData) => {
      const user = usersMap.get(userData.userId);
      const username = user?.username;
      const firstName = user?.first_name;
      const lastName = user?.last_name;
      const picture = user?.picture;

      return { ...userData, username, first_name: firstName, last_name: lastName, picture };
    });
  });
};

export {
  generateLink,
  buildTaskRequests,
  transformTaskRequests,
};
