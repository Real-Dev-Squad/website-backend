/* eslint-disable no-dupe-keys */
import { fetch } from "../utils/fetch.js";
import logger from "../utils/logger.js";

/**
 * Extracts only the necessary details required from the object returned by Github API
 * @param data {Object} - Object returned by Github API
 */

const extractPRdetails = (data) => {
  const allPRs = [];
  data.items.forEach(
    ({
      title,
      user,
      html_url: url,
      state,
      created_at: createdAt,
      updated_at: updatedAt,
      repository_url: repositoryUrl,
      labels,
      assignees,
    }) => {
      const allAssignees = assignees.map((object) => object.login);
      const allLabels = labels.map((object) => object.name);
      const repositoryUrlSplit = repositoryUrl.split("/");
      const repository = repositoryUrlSplit[repositoryUrlSplit.length - 1];
      allPRs.push({
        title,
        username: user.login,
        state,
        createdAt,
        updatedAt,
        repository,
        url,
        labels: allLabels,
        assignees: allAssignees,
      });
    }
  );
  return allPRs;
};

/**
 * Creates the custom API URL with the required params in the format
 * expected by Github
 * https://docs.github.com/en/free-pro-team@latest/rest/reference/search
 * @access private
 * @param searchParams {Object} - List of params to create github API URL
 * @param resultsOptions {Object} - Ordering and pagination of results
 */
const getGithubURL = (searchParams, resultsOptions = {}, searchString) => {
  const baseURL = "https://api.github.com/search/issues";
  const queryParams = [];

  // Add search string if provided
  if (searchString) {
    queryParams.push(searchString);
  }

  // Add all search params to the query
  Object.keys(searchParams).forEach((key) => {
    if (searchParams[key]) {
      queryParams.push(`${key}:${searchParams[key]}`);
    }
  });

  // Add sorting and order params
  if (resultsOptions.sort) {
    queryParams.push(`sort:${resultsOptions.sort}`);
  }
  if (resultsOptions.order) {
    queryParams.push(`order:${resultsOptions.order}`);
  }

  // Construct the final URL
  const queryString = queryParams.join("+");
  const url = `${baseURL}?q=${queryString}`;

  // Add pagination if provided
  if (resultsOptions.page) {
    return `${url}&page=${resultsOptions.page}`;
  }
  if (resultsOptions.per_page) {
    return `${url}&per_page=${resultsOptions.per_page}`;
  }
  return url;
};

function getFetch(url) {
  return fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });
}

// function getFetchWithAuthToken(url, params = null, headers = null) {
//   return utils.fetch(url, {
//     method: "GET",
//     headers: {
//       Accept: "application/vnd.github.v3+json",
//       ...headers,
//     },
//     params,
//   });
// }

const fetchPRsByUser = async (username) => {
  const searchParams = {
    is: "pr",
    author: username,
  };
  const url = getGithubURL(searchParams);
  const data = await getFetch(url);
  return extractPRdetails(data);
};

const fetchOpenPRs = async (params = {}) => {
  const searchParams = {
    is: "pr",
    is_open: "true",
    ...params,
  };
  const url = getGithubURL(searchParams);
  const data = await getFetch(url);
  return extractPRdetails(data);
};

const fetchMergedPRs = async (params = {}) => {
  const searchParams = {
    is: "pr",
    is: "merged",
    ...params,
  };
  const url = getGithubURL(searchParams);
  const data = await getFetch(url);
  return extractPRdetails(data);
};

const fetchOpenIssues = async (params = {}) => {
  const searchParams = {
    is: "issue",
    is_open: "true",
    ...params,
  };
  const url = getGithubURL(searchParams);
  const data = await getFetch(url);
  return extractPRdetails(data);
};

const fetchClosedIssues = async (params = {}) => {
  const searchParams = {
    is: "issue",
    is: "closed",
    ...params,
  };
  const url = getGithubURL(searchParams);
  const data = await getFetch(url);
  return extractPRdetails(data);
};

const fetchIssues = async () => {
  const searchParams = {
    is: "issue",
  };
  const url = getGithubURL(searchParams);
  const data = await getFetch(url);
  return extractPRdetails(data);
};

const fetchIssuesById = async (repositoryName, issueId) => {
  const url = `https://api.github.com/repos/${repositoryName}/issues/${issueId}`;
  const data = await getFetch(url);
  return {
    title: data.title,
    username: data.user.login,
    state: data.state,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    repository: repositoryName,
    url: data.html_url,
    labels: data.labels.map((label) => label.name),
    assignees: data.assignees.map((assignee) => assignee.login),
  };
};

const fetchLastMergedPR = async (username) => {
  const searchParams = {
    is: "pr",
    is: "merged",
    author: username,
  };
  const resultsOptions = {
    sort: "updated",
    order: "desc",
    per_page: 1,
  };
  const url = getGithubURL(searchParams, resultsOptions);
  const data = await getFetch(url);
  if (data.items.length === 0) {
    return null;
  }
  return extractPRdetails(data)[0];
};

const isLastPRMergedWithinDays = async (username, days) => {
  try {
    const lastMergedPR = await fetchLastMergedPR(username);
    if (!lastMergedPR) {
      return false;
    }
    const lastMergedDate = new Date(lastMergedPR.updatedAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - lastMergedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  } catch (error) {
    logger.error("Error in isLastPRMergedWithinDays", error);
    return false;
  }
};

export {
  fetchPRsByUser,
  fetchOpenPRs,
  fetchMergedPRs,
  getFetch,
  extractPRdetails,
  fetchIssues,
  fetchOpenIssues,
  fetchClosedIssues,
  fetchLastMergedPR,
  isLastPRMergedWithinDays,
  fetchIssuesById,
};
