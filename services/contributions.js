const githubService = require("../services/githubService");
const tasks = require("../models/tasks");
const { fetchUser } = require("../models/users");
const userUtils = require("../utils/users");
/**
 * Get the contributions of the user
 * @param {string} username
 */

const getUserContributions = async (username) => {
  const contributions = {};
  const { data } = await githubService.fetchPRsByUser(username);
  const allUserTasks = await tasks.fetchUserTasks(username);
  const noteworthy = [];
  const all = [];

  if (data.total_count) {
    const allPRsDetails = extractPRdetails(data);

    const participantsDetailsMap = new Map();
    const prMaps = new Map();

    allPRsDetails.forEach((pr) => {
      prMaps.set(pr.url, pr);
    });

    for (const task of allUserTasks) {
      const noteworthyObject = {};
      const participantsDetails = [];

      noteworthyObject.task = extractTaskdetails(task);

      if (Array.isArray(task.participants)) {
        for (const userId of task.participants) {
          const username = await userUtils.getUsername(userId);
          const userDetails = participantsDetailsMap.get(username);
          if (userDetails) {
            participantsDetails.push(userDetails);
          } else {
            const user = await getUserDetails(username);
            participantsDetailsMap.set(username, user);
            participantsDetails.push(user);
          }
        }
      }

      noteworthyObject.task.participants = participantsDetails;
      const prList = [];

      task.links?.forEach((link) => {
        const prObject = prMaps.get(link);
        if (prObject) {
          prList.push(prObject);
          prMaps.delete(link);
        }
      });

      noteworthyObject.prList = prList;

      if (task.isNoteworthy) {
        noteworthy.push(noteworthyObject);
      } else {
        all.push(noteworthyObject);
      }
    }

    for (const prDetails of prMaps.values()) {
      const allObject = {
        prList: [prDetails],
        task: {},
      };
      all.push(allObject);
    }
  }
  contributions.noteworthy = noteworthy;
  contributions.all = all;
  return contributions;
};

/**
 * Extracts only the necessary details required from the object returned by Github API
 * @param data {Object} - Object returned by Github API
 */

const extractPRdetails = (data) => {
  const allPRs = [];
  data.items.forEach(({ title, user, html_url: url, state, created_at: createdAt, updated_at: updatedAt }) => {
    allPRs.push({
      title,
      state,
      createdAt,
      updatedAt,
      url,
      raisedBy: user.login,
    });
  });
  return allPRs;
};

/**
 * Extracts only the necessary details required from the object returned by Task API
 * @param data {Object} - Object returned by Task API
 */

const extractTaskdetails = (data) => {
  const { id, title, purpose, endsOn, startedOn, dependsOn, status, participants, featureUrl, isNoteworthy } = data;
  return {
    id,
    title,
    purpose,
    endsOn,
    startedOn,
    dependsOn,
    status,
    participants,
    featureUrl,
    isNoteworthy,
  };
};

/**
 * Get the user details
 * @param username {string}
 */

const getUserDetails = async (username) => {
  const { user } = await fetchUser({ username });
  const userDetails = extractUserDetails(user);
  return userDetails;
};

/**
 * Extracts only the necessary details required from the object returned by user API
 * @param data {Object} - Object returned by User api
 */

const extractUserDetails = (data) => {
  const { username, firstname, lastname, img } = data;
  if (!data.incompleteUserDetails) {
    return {
      firstname,
      lastname,
      img,
      username,
    };
  } else {
    return { username };
  }
};

module.exports = {
  getUserContributions,
};
